export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

interface GlobalMarketData {
  mcapChange24h: number;
  btcDominance: number;
  marketCapUsd: number;
}

export async function GET() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const url = `${COINGECKO_BASE}/global`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const globalData = data.data;

    if (!globalData) {
      throw new Error('No global data received');
    }

    const result: GlobalMarketData = {
      mcapChange24h: globalData.market_cap_change_percentage_24h_usd || 0,
      btcDominance: globalData.market_cap_percentage?.btc || 0,
      marketCapUsd: globalData.total_market_cap?.usd || 0
    };

    return Response.json(result);

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Global market data error:', error);
    
    // Return fallback data
    const fallback: GlobalMarketData = {
      mcapChange24h: 0.5,
      btcDominance: 50.2,
      marketCapUsd: 2450000000000
    };

    return Response.json(fallback);
  }
}
