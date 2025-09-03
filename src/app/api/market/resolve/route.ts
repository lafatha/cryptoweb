export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

interface CoinSearchResult {
  id: string;
  symbol: string;
  name: string;
  thumb?: string;
}

// Local token mapping for common coins
const LOCAL_TOKENS: Record<string, { id: string; symbol: string; name: string }> = {
  'btc': { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
  'eth': { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
  'sol': { id: 'solana', symbol: 'sol', name: 'Solana' },
  'ada': { id: 'cardano', symbol: 'ada', name: 'Cardano' },
  'dot': { id: 'polkadot', symbol: 'dot', name: 'Polkadot' },
  'matic': { id: 'matic-network', symbol: 'matic', name: 'Polygon' },
  'link': { id: 'chainlink', symbol: 'link', name: 'Chainlink' },
  'uni': { id: 'uniswap', symbol: 'uni', name: 'Uniswap' },
  'ltc': { id: 'litecoin', symbol: 'ltc', name: 'Litecoin' },
  'bch': { id: 'bitcoin-cash', symbol: 'bch', name: 'Bitcoin Cash' },
  'usdt': { id: 'tether', symbol: 'usdt', name: 'Tether' },
  'usdc': { id: 'usd-coin', symbol: 'usdc', name: 'USD Coin' },
  'bnb': { id: 'binancecoin', symbol: 'bnb', name: 'BNB' },
  'xrp': { id: 'ripple', symbol: 'xrp', name: 'XRP' },
  'doge': { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin' },
  'avax': { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche' },
  'shib': { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu' },
  'atom': { id: 'cosmos', symbol: 'atom', name: 'Cosmos' },
  'near': { id: 'near', symbol: 'near', name: 'NEAR Protocol' },
  'algo': { id: 'algorand', symbol: 'algo', name: 'Algorand' },
  'apu': { id: 'apu', symbol: 'apu', name: 'Apu Apustaja' }
};

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/^\$/, '');
}

function isValidQuery(query: string): boolean {
  return query.length >= 2 && query.length <= 20 && /^[a-zA-Z0-9]+$/.test(query);
}

async function searchCoinGecko(query: string): Promise<CoinSearchResult | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `${COINGECKO_BASE}/search?query=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const coins = data.coins || [];

    if (coins.length === 0) {
      return null;
    }

    // Find best match: exact symbol first, then name contains
    let bestMatch = coins.find((coin: any) => 
      coin.symbol?.toLowerCase() === query.toLowerCase()
    );

    if (!bestMatch) {
      bestMatch = coins.find((coin: any) => 
        coin.name?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (!bestMatch) {
      bestMatch = coins[0]; // Take first result if no perfect match
    }

    return {
      id: bestMatch.id,
      symbol: bestMatch.symbol,
      name: bestMatch.name,
      thumb: bestMatch.thumb
    };

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('CoinGecko search error:', error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return Response.json({
        ok: false,
        code: "BAD_REQUEST",
        message: "Query parameter 'q' is required"
      }, { status: 400 });
    }

    const normalizedQuery = normalizeQuery(query);

    if (!isValidQuery(normalizedQuery)) {
      return Response.json({
        ok: false,
        code: "BAD_REQUEST",
        message: "Query must be 2-20 alphanumeric characters"
      }, { status: 400 });
    }

    // Check local mapping first
    const localMatch = LOCAL_TOKENS[normalizedQuery];
    if (localMatch) {
      return Response.json({
        ok: true,
        id: localMatch.id,
        symbol: localMatch.symbol,
        name: localMatch.name
      });
    }

    // Search CoinGecko
    const result = await searchCoinGecko(normalizedQuery);
    if (result) {
      return Response.json({
        ok: true,
        id: result.id,
        symbol: result.symbol,
        name: result.name
      });
    }

    // Not found
    return Response.json({
      ok: false,
      code: "NOT_FOUND",
      message: `Coin '${query}' not found`
    }, { status: 404 });

  } catch (error) {
    console.error('Market resolve error:', error);
    return Response.json({
      ok: false,
      code: "INTERNAL_ERROR",
      message: "Internal server error"
    }, { status: 500 });
  }
}
