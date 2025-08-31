import { fetchWithRetry } from "@/lib/net/fetchWithRetry";
import { mapError } from "@/lib/net/httpError";
import { headlinesFor } from "@/lib/sentiment/cryptoPanic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  context?: any;
}

interface AssetContext {
  id: string;
  symbol: string;
  name: string;
  priceUsd: number;
  change24h: number;
  history7d: [number, number][];
  headlines: { title: string; url: string }[];
}

export async function POST(request: Request) {
  try {
    const { GROQ_API_KEY } = process.env;

    if (!GROQ_API_KEY) {
      return Response.json({
        ok: false,
        code: "NO_API_KEY",
        message: "AI chat service not configured"
      });
    }

    // Parse request body
    let body: ChatRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      return Response.json({
        ok: false,
        code: "BAD_REQUEST",
        message: "Invalid JSON in request body"
      });
    }

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json({
        ok: false,
        code: "BAD_REQUEST", 
        message: "Messages array is required"
      });
    }

    // Extract coin candidates from user message (max 2)
    const lastUserMessage = body.messages[body.messages.length - 1];
    const coinCandidates = extractCoinCandidates(lastUserMessage?.content || '');
    
    // Resolve coins and get context
    const resolvedAssets: AssetContext[] = [];
    for (const candidate of coinCandidates.slice(0, 2)) {
      try {
        const asset = await resolveCoinContext(candidate);
        if (asset) {
          resolvedAssets.push(asset);
        }
      } catch (error) {
        console.error(`Failed to resolve coin ${candidate}:`, error);
      }
    }

    const systemPrompt = "Kamu asisten kripto. Jangan memberi instruksi buy/sell. Jawab ringkas, edukatif, berbasis data. Jika user bertanya 'bagus beli X?', rangkum: harga, %24h/7d, risiko (volatilitas/likuiditas/news negatif), dan sarankan DYOR. Hindari perintah beli/jual.";

    // Prepare messages
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...body.messages
    ];

    // Add resolved asset context if any
    if (resolvedAssets.length > 0) {
      const assetContext = {
        assets: resolvedAssets,
        note: "Use this data to provide accurate, current information about the mentioned cryptocurrencies."
      };
      messages.splice(1, 0, { role: 'system', content: `Asset Context: ${JSON.stringify(assetContext)}` });
    }

    // Add general context if provided
    if (body.context) {
      const contextMessage = `Additional Context: ${JSON.stringify(body.context)}`;
      messages.splice(-1, 0, { role: 'system', content: contextMessage });
    }

    // Try SSE streaming first
    try {
      const streamResponse = await fetchWithRetry(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 1000
          })
        },
        { timeoutMs: 20000, retries: 0 }
      );

      // If streaming succeeds, proxy the SSE response
      if (streamResponse.body) {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const readableStream = new ReadableStream({
          async start(controller) {
            const reader = streamResponse.body!.getReader();
            
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    
                    if (data === '[DONE]') {
                      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                      controller.close();
                      return;
                    }

                    try {
                      const parsed = JSON.parse(data);
                      const content = parsed.choices?.[0]?.delta?.content;
                      
                      if (content) {
                        const sseData = JSON.stringify({ content });
                        controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
                      }
                    } catch (parseError) {
                      // Skip invalid JSON chunks
                      continue;
                    }
                  }
                }
              }
            } catch (error) {
              console.error('SSE streaming error:', error);
              // If no coins found, send helpful message
              if (coinCandidates.length > 0 && resolvedAssets.length === 0) {
                const notFoundMsg = `Aku tidak menemukan koin ${coinCandidates.join(', ')} di CoinGecko. Bisa jadi belum terdaftar/kurang likuid. Jika punya alamat kontrak & chain, aku bisa cek lagi.`;
                const sseData = JSON.stringify({ content: notFoundMsg });
                controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
              }
              controller.error(error);
            } finally {
              reader.releaseLock();
            }
          }
        });

        return new Response(readableStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          }
        });
      }
    } catch (streamError) {
      console.log('SSE streaming failed, falling back to JSON:', streamError);
      // Continue to JSON fallback below
    }

    // JSON Fallback: Non-streaming request
    try {
      const jsonResponse = await fetchWithRetry(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            stream: false,
            temperature: 0.7,
            max_tokens: 1000
          })
        },
        { timeoutMs: 20000, retries: 1 }
      );

      const data = await jsonResponse.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return Response.json({
          ok: false,
          code: "NO_RESPONSE",
          message: "Tidak ada respons dari AI"
        });
      }

      return Response.json({
        ok: true,
        content: content
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

    } catch (jsonError) {
      const mapped = mapError(jsonError, "LLM");
      return Response.json({
        ok: false,
        code: mapped.code,
        message: mapped.message
      });
    }

  } catch (error) {
    const mapped = mapError(error, "LLM");
    return Response.json({
      ok: false,
      code: mapped.code,
      message: mapped.message
    });
  }
}

// Helper functions
function extractCoinCandidates(message: string): string[] {
  const regex = /\$?([a-z0-9]{2,20})/gi;
  const matches = message.match(regex) || [];
  
  const stopwords = new Set([
    'buy', 'beli', 'bagus', 'coin', 'token', 'crypto', 'the', 'and', 'or',
    'to', 'from', 'is', 'are', 'was', 'were', 'akan', 'itu', 'ini', 'yang',
    'dan', 'atau', 'untuk', 'dari', 'dengan', 'ke', 'di', 'pada', 'dalam'
  ]);
  
  return matches
    .map(match => match.replace(/^\$/, '').toLowerCase())
    .filter(token => !stopwords.has(token) && token.length >= 2 && token.length <= 20)
    .slice(0, 2); // Max 2 candidates
}

async function resolveCoinContext(candidate: string): Promise<AssetContext | null> {
  try {
    // 1. Resolve coin ID
    const resolveResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/market/resolve?q=${encodeURIComponent(candidate)}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!resolveResponse.ok) {
      return null;
    }

    const resolveData = await resolveResponse.json();
    if (!resolveData.ok) {
      return null;
    }

    const { id, symbol, name } = resolveData;

    // 2. Get price data
    const priceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`, {
      headers: {
        'Accept': 'application/json',
        'X-CG-Demo-API-Key': process.env.coingecko || 'CG-HoQRu1u55WSQMiR1o4uhuUsS'
      },
      cache: 'no-store'
    });

    let priceUsd = 0;
    let change24h = 0;

    if (priceResponse.ok) {
      const priceData = await priceResponse.json();
      const coinData = priceData[id];
      if (coinData) {
        priceUsd = coinData.usd || 0;
        change24h = coinData.usd_24h_change || 0;
      }
    }

    // 3. Get 7-day history
    let history7d: [number, number][] = [];
    try {
      const historyResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`, {
        headers: {
          'Accept': 'application/json',
          'X-CG-Demo-API-Key': process.env.coingecko || 'CG-HoQRu1u55WSQMiR1o4uhuUsS'
        },
        cache: 'no-store'
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        history7d = historyData.prices || [];
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }

    // 4. Get headlines
    let headlines: { title: string; url: string }[] = [];
    try {
      headlines = await headlinesFor(symbol, 3);
    } catch (error) {
      console.error('Error fetching headlines:', error);
    }

    return {
      id,
      symbol,
      name,
      priceUsd: Math.round(priceUsd * 100) / 100,
      change24h: Math.round(change24h * 10) / 10,
      history7d,
      headlines
    };

  } catch (error) {
    console.error(`Error resolving coin context for ${candidate}:`, error);
    return null;
  }
}
