import { NextResponse } from 'next/server';
import { headlinesFor } from '@/lib/sentiment/cryptoPanic';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTC';
    const limit = parseInt(searchParams.get('limit') || '5');

    // Validate parameters
    if (limit < 1 || limit > 20) {
      return NextResponse.json({
        ok: false,
        code: "BAD_REQUEST",
        message: "Limit must be between 1 and 20"
      }, { status: 400 });
    }

    try {
      // Ambil berita dari CryptoPanic API
      const headlines = await headlinesFor(symbol, limit);
      
      if (headlines.length === 0) {
        return NextResponse.json({
          ok: false,
          code: "NO_DATA",
          message: `Tidak ada berita tersedia untuk ${symbol.toUpperCase()} saat ini`
        }, { status: 404 });
      }

      // Format respons sesuai ketentuan
      const formattedNews = headlines.map((news, index) => ({
        id: index + 1,
        title: news.title,
        url: news.url,
        symbol: symbol.toUpperCase()
      }));

      return NextResponse.json({
        ok: true,
        symbol: symbol.toUpperCase(),
        count: formattedNews.length,
        news: formattedNews,
        lastUpdated: new Date().toISOString()
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' // Cache 5 menit
        }
      });

    } catch (apiError) {
      console.error('CryptoPanic API error:', apiError);
      return NextResponse.json({
        ok: false,
        code: "API_ERROR",
        message: `Maaf, berita untuk ${symbol.toUpperCase()} tidak tersedia saat ini`
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Error in crypto news API:', error);
    return NextResponse.json({
      ok: false,
      code: "INTERNAL_ERROR",
      message: "Terjadi kesalahan sistem"
    }, { status: 500 });
  }
}
