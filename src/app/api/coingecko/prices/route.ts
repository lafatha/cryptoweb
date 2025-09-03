import { NextResponse } from 'next/server';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

interface CoinPriceData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  image?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols');
    const ids = searchParams.get('ids');

    if (!symbols && !ids) {
      return NextResponse.json({
        ok: false,
        code: "BAD_REQUEST",
        message: "Parameter 'symbols' atau 'ids' diperlukan"
      }, { status: 400 });
    }

    let coinData: CoinPriceData[] = [];

    if (symbols) {
      // Jika menggunakan symbols, perlu search dulu untuk mendapatkan IDs
      const symbolList = symbols.split(',').map(s => s.trim().toLowerCase());
      
      for (const symbol of symbolList.slice(0, 5)) { // Max 5 coins
        try {
          const coinInfo = await searchAndGetPrice(symbol);
          if (coinInfo) {
            coinData.push(coinInfo);
          }
        } catch (error) {
          console.error(`Error getting price for ${symbol}:`, error);
        }
      }
    } else if (ids) {
      // Jika menggunakan IDs langsung
      const idList = ids.split(',').map(id => id.trim());
      coinData = await getPricesByIds(idList);
    }

    if (coinData.length === 0) {
      return NextResponse.json({
        ok: false,
        code: "NO_DATA",
        message: "Data coin tidak ditemukan"
      }, { status: 404 });
    }

    // Format response sesuai ketentuan
    const formattedData = coinData.map(coin => {
      const priceFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: coin.current_price < 1 ? 4 : 2,
        maximumFractionDigits: coin.current_price < 1 ? 8 : 2,
      }).format(coin.current_price);

      const marketCapFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
      }).format(coin.market_cap);

      const changeFormatted = coin.price_change_percentage_24h >= 0 ? 
        `+${coin.price_change_percentage_24h.toFixed(1)}%` :
        `${coin.price_change_percentage_24h.toFixed(1)}%`;

      return {
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        price_formatted: priceFormatted,
        market_cap: coin.market_cap,
        market_cap_formatted: marketCapFormatted,
        price_change_24h: coin.price_change_percentage_24h,
        change_formatted: changeFormatted,
        description: `Harga ${coin.name} (${coin.symbol.toUpperCase()}) saat ini sekitar ${priceFormatted} dengan market cap ${marketCapFormatted} dan perubahan 24 jam ${changeFormatted}.`
      };
    });

    return NextResponse.json({
      ok: true,
      count: formattedData.length,
      coins: formattedData,
      lastUpdated: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' // Cache 1 menit
      }
    });

  } catch (error) {
    console.error('Error in coin price API:', error);
    return NextResponse.json({
      ok: false,
      code: "INTERNAL_ERROR",
      message: "Terjadi kesalahan sistem"
    }, { status: 500 });
  }
}

async function searchAndGetPrice(symbol: string): Promise<CoinPriceData | null> {
  try {
    // 1. Search coin by symbol
    const searchResponse = await fetch(
      `${COINGECKO_BASE}/search?query=${symbol}`,
      { 
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      }
    );

    if (!searchResponse.ok) return null;

    const searchData = await searchResponse.json();
    const coin = searchData.coins?.find((c: Record<string, unknown>) => 
      c.symbol?.toString().toLowerCase() === symbol.toLowerCase()
    );

    if (!coin) return null;

    // 2. Get market data
    const marketResponse = await fetch(
      `${COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${coin.id}`,
      {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      }
    );

    if (!marketResponse.ok) return null;

    const marketData = await marketResponse.json();
    if (!marketData || marketData.length === 0) return null;

    const coinData = marketData[0];
    
    return {
      id: coinData.id,
      symbol: coinData.symbol,
      name: coinData.name,
      current_price: coinData.current_price || 0,
      market_cap: coinData.market_cap || 0,
      price_change_percentage_24h: coinData.price_change_percentage_24h || 0,
      image: coinData.image
    };

  } catch (error) {
    console.error(`Error searching coin ${symbol}:`, error);
    return null;
  }
}

async function getPricesByIds(ids: string[]): Promise<CoinPriceData[]> {
  try {
    const response = await fetch(
      `${COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${ids.join(',')}`,
      {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    
    return data.map((coin: Record<string, unknown>) => ({
      id: String(coin.id || ''),
      symbol: String(coin.symbol || ''),
      name: String(coin.name || ''),
      current_price: Number(coin.current_price) || 0,
      market_cap: Number(coin.market_cap) || 0,
      price_change_percentage_24h: Number(coin.price_change_percentage_24h) || 0,
      image: String(coin.image || '')
    }));

  } catch (error) {
    console.error('Error getting prices by IDs:', error);
    return [];
  }
}
