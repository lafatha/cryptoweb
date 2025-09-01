import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids') || 'bitcoin,ethereum'
    const vs_currencies = searchParams.get('vs_currencies') || 'usd'
    const include_24hr_change = searchParams.get('include_24hr_change') || 'false'

    const url = `${COINGECKO_API_BASE}/simple/price?ids=${ids}&vs_currencies=${vs_currencies}&include_24hr_change=${include_24hr_change}`
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 15 }, // Cache for 15 seconds for faster updates
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    console.error('Error fetching coin prices:', error)
    
    // Return fallback data
    const fallbackData = {
      ethereum: { usd: 2500, usd_24h_change: 2.5 },
      bitcoin: { usd: 43000, usd_24h_change: 1.2 },
      tether: { usd: 1.0, usd_24h_change: 0.1 },
      'usd-coin': { usd: 1.0, usd_24h_change: 0.0 },
      chainlink: { usd: 15.5, usd_24h_change: 3.2 },
      uniswap: { usd: 8.2, usd_24h_change: -1.5 },
    }

    return NextResponse.json(fallbackData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  }
}
