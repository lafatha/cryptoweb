import { NextResponse } from "next/server";
import { AnalysisSchema } from "@/lib/ai/schemas";
import { computeMetrics as computePortfolioMetrics } from "@/lib/metrics/portfolio";
import { headlinesFor, scoreTitles } from "@/lib/sentiment/cryptoPanic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AnalysisRequest {
  holdings?: Array<{
    symbol: string;
    amount: number;
    value: number;
    change24h?: number;
  }>;
  totalValue?: number;
  market?: {
    trending?: string[];
    gainers?: string[];
    losers?: string[];
  };
  news?: Array<{
    title: string;
    sentiment?: string;
  }>;
}

interface GlobalMarketData {
  mcapChange24h: number;
  btcDominance: number;
  marketCapUsd: number;
}

interface EnhancedMetrics {
  portfolio: {
    totalValue: number;
    avgChange24h: number;
    biggestMover: { symbol: string; change24h: number } | null;
    dominance: { symbol: string; share: number } | null;
    hhi: number;
    stablecoinExposure: number;
  };
  global: GlobalMarketData;
  sentiment: {
    ratioNeg: number;
    pos: number;
    neg: number;
    sampleTitles: string[];
  };
  trending: string[];
}

export async function POST(request: Request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const { GROQ_API_KEY } = process.env;

    if (!GROQ_API_KEY) {
      return NextResponse.json({
        ok: false,
        code: "NO_API_KEY",
        message: "AI service not configured"
      }, { status: 500 });
    }

    // Parse request body
    let body: AnalysisRequest = {};
    try {
      const text = await request.text();
      if (text.trim()) {
        body = JSON.parse(text);
      }
    } catch (parseError) {
      return NextResponse.json({
        ok: false,
        code: "BAD_REQUEST",
        message: "Invalid JSON in request body"
      }, { status: 400 });
    }

    // Precompute metrics
    const enhancedMetrics = await computeEnhancedMetrics(body);
    
    // Build context for LLM
    const contextForLLM = {
      holdingsTop5: (body.holdings || []).slice(0, 5),
      metrics: enhancedMetrics.portfolio,
      global: enhancedMetrics.global,
      news: enhancedMetrics.sentiment,
      trending: enhancedMetrics.trending
    };

    const systemPrompt = `KELUARKAN HANYA JSON:
{
  "insights": [
    {
      "title": "string",
      "body": "string", 
      "severity": "info"|"warning"|"danger",
      "confidence": number
    }
  ],
  "watchlist": [
    {
      "symbol": "string",
      "reason": "string"
    }
  ]
}

Buat 3–6 insight BERAGAM (tanpa duplikasi judul), prioritaskan kategori:
1) Market Sentiment (WAJIB): rangkum mcapChange24h & avgChange24h portofolio.
   Severity rules:
   - danger jika mcapChange24h <= -3 atau avgChange24h <= -3
   - warning jika -3 < change <= -1
   - info jika lainnya
2) Biggest Mover: aset dengan |%24h| tertinggi.
3) Risk/News (jika ratioNeg >= 0.5): jelaskan risiko dari berita → severity warning/danger sesuai ratio.
4) Diversification: nilai dominance & HHI; warning jika share top1 > 0.6; info jika 0.4..0.6; danger jika > 0.8.
5) Opportunity/Trending: 1–2 ide dari trending (alasan singkat).

Aturan:
- Angka USD bulat 2 desimal; persentase 1 desimal; jangan notasi ilmiah.
- confidence 0..1.
- Jangan memberi nasihat finansial; edukasi & indikator data saja.`;

    // First attempt
    const firstResult = await callGroqJSON(systemPrompt, contextForLLM, controller.signal);
    let parsed = safeParse(firstResult);
    
    // Retry if needed
    if (!parsed.success || parsed.data.insights.length < 3 || hasDuplicateTitles(parsed.data.insights)) {
      const retryPrompt = `${systemPrompt}

PERBAIKI: Jawabanmu belum memenuhi spesifikasi (min 3 insight unik). Mohon keluarkan ulang *HANYA JSON* sesuai schema, lengkapi kategori yang kurang. Jangan ada teks di luar JSON.`;
      
      const retryResult = await callGroqJSON(retryPrompt, contextForLLM, controller.signal);
      parsed = safeParse(retryResult);
    }

    clearTimeout(timeoutId);

    if (!parsed.success || parsed.data.insights.length < 3) {
      return NextResponse.json({
        ok: false,
        code: "BAD_JSON",
        message: "Analisis gagal (format). Coba lagi."
      }, { status: 200 });
    }

    // Deduplicate titles (case-insensitive)
    let uniqueInsights = deduplicateInsights(parsed.data.insights);
    
    // Post-process: guarantee severity mix based on triggers
    uniqueInsights = guaranteeSeverityMix(uniqueInsights, enhancedMetrics);
    
    return NextResponse.json({
      ok: true,
      insights: uniqueInsights,
      watchlist: parsed.data.watchlist || []
    });

  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return NextResponse.json({
        ok: false,
        code: "LLM_DOWN",
        message: "AI layanan sementara tidak tersedia."
      }, { status: 503 });
    }

    if (error.message?.includes('HTTP 5')) {
      return NextResponse.json({
        ok: false,
        code: "LLM_DOWN",
        message: "AI layanan sementara tidak tersedia."
      }, { status: 503 });
    }

    if (error.message?.includes('HTTP 4')) {
      return NextResponse.json({
        ok: false,
        code: "LLM_FAIL",
        message: "Gagal menghubungi AI."
      }, { status: 500 });
    }

    return NextResponse.json({
      ok: false,
      code: "LLM_FAIL",
      message: "Gagal menghubungi AI."
    }, { status: 500 });
  }
}

async function computeEnhancedMetrics(body: AnalysisRequest): Promise<EnhancedMetrics> {
  const holdings = body.holdings || [];
  
  // 1. Compute portfolio metrics
  const portfolioMetrics = computePortfolioMetrics(holdings);
  
  // 2. Fetch global market data
  let globalData: GlobalMarketData = {
    mcapChange24h: 0.5,
    btcDominance: 50.2,
    marketCapUsd: 2450000000000
  };
  
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/market/global`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    
    if (response.ok) {
      globalData = await response.json();
    }
  } catch (error) {
    console.error('Error fetching global data:', error);
  }
  
  // 3. Fetch headlines and compute sentiment
  let sentimentData = {
    ratioNeg: 0,
    pos: 0,
    neg: 0,
    sampleTitles: [] as string[]
  };
  
  if (holdings.length > 0) {
    try {
      const topSymbols = holdings
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .map(h => h.symbol);
      
      const allHeadlines: string[] = [];
      
      for (const symbol of topSymbols) {
        try {
          const headlines = await headlinesFor(symbol, 3);
          allHeadlines.push(...headlines.map(h => h.title));
        } catch (error) {
          console.error(`Error fetching headlines for ${symbol}:`, error);
        }
      }
      
      if (allHeadlines.length > 0) {
        const sentiment = scoreTitles(allHeadlines);
        sentimentData = {
          ratioNeg: sentiment.ratioNeg,
          pos: sentiment.pos,
          neg: sentiment.neg,
          sampleTitles: allHeadlines.slice(0, 3)
        };
      }
    } catch (error) {
      console.error('Error computing sentiment:', error);
    }
  }
  
  // 4. Fetch trending coins
  let trending: string[] = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT']; // Fallback
  
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/search/trending', {
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      trending = data.coins?.slice(0, 5).map((item: any) => item.item.symbol.toUpperCase()) || trending;
    }
  } catch (error) {
    console.error('Error fetching trending:', error);
  }
  
  return {
    portfolio: portfolioMetrics,
    global: globalData,
    sentiment: sentimentData,
    trending
  };
}

async function callGroqJSON(systemPrompt: string, context: any, signal: AbortSignal): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: JSON.stringify(context)
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      top_p: 0.8,
      max_tokens: 900
    }),
    signal,
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error("No response content from LLM");
  }

  return content;
}

function safeParse(jsonString: string): { success: boolean; data: any } {
  try {
    const parsed = JSON.parse(jsonString);
    const validated = AnalysisSchema.parse(parsed);
    return { success: true, data: validated };
  } catch (error) {
    return { success: false, data: null };
  }
}

function hasDuplicateTitles(insights: any[]): boolean {
  const titles = insights.map(i => i.title?.toLowerCase() || '');
  return new Set(titles).size !== titles.length;
}

function deduplicateInsights(insights: any[]): any[] {
  const seen = new Set<string>();
  return insights.filter(insight => {
    const titleLower = insight.title?.toLowerCase() || '';
    if (seen.has(titleLower)) {
      return false;
    }
    seen.add(titleLower);
    return true;
  });
}

function guaranteeSeverityMix(insights: any[], metrics: EnhancedMetrics): any[] {
  const { portfolio, global, sentiment } = metrics;
  
  // Determine triggers
  const dangerTrigger = 
    portfolio.avgChange24h <= -3 || 
    global.mcapChange24h <= -3 ||
    sentiment.ratioNeg >= 0.7 || 
    (portfolio.biggestMover?.change24h || 0) <= -6 ||
    (portfolio.dominance?.share || 0) > 0.8;
    
  const warningTrigger = 
    portfolio.avgChange24h <= -1 || 
    global.mcapChange24h <= -1 ||
    sentiment.ratioNeg >= 0.4 || 
    (portfolio.dominance?.share || 0) > 0.6;
  
  // Check current severity distribution
  const hasDanger = insights.some(i => i.severity === 'danger');
  const hasWarning = insights.some(i => i.severity === 'warning');
  
  // Upgrade severity if needed
  if (dangerTrigger && !hasDanger) {
    // Find suitable insight to upgrade to danger
    const marketInsight = insights.find(i => 
      i.title?.toLowerCase().includes('market') || 
      i.title?.toLowerCase().includes('sentiment') ||
      i.title?.toLowerCase().includes('diversification')
    );
    if (marketInsight) {
      marketInsight.severity = 'danger';
    }
  }
  
  if (warningTrigger && !hasWarning && !hasDanger) {
    // Find suitable insight to upgrade to warning  
    const riskInsight = insights.find(i => 
      i.title?.toLowerCase().includes('risk') || 
      i.title?.toLowerCase().includes('news') ||
      i.title?.toLowerCase().includes('diversification') ||
      i.title?.toLowerCase().includes('market')
    );
    if (riskInsight) {
      riskInsight.severity = 'warning';
    }
  }
  
  return insights;
}
