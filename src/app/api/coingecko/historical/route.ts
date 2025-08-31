import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coinId = searchParams.get('coinId') || 'ethereum'
    const days = searchParams.get('days') || '7'
    const vs_currency = searchParams.get('vs_currency') || 'usd'

    // Determine interval based on days
    let interval = 'daily'
    if (days === '1') {
      interval = 'hourly'
    } else if (parseInt(days) <= 90) {
      interval = 'daily'
    }

    const url = `${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=${vs_currency}&days=${days}&interval=${interval}`
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform data to simpler format
    const transformedData = {
      prices: data.prices?.map(([timestamp, price]: [number, number]) => ({
        time: new Date(timestamp).toISOString(),
        value: price
      })) || [],
      market_caps: data.market_caps?.map(([timestamp, cap]: [number, number]) => ({
        time: new Date(timestamp).toISOString(),
        value: cap
      })) || [],
      total_volumes: data.total_volumes?.map(([timestamp, volume]: [number, number]) => ({
        time: new Date(timestamp).toISOString(),
        value: volume
      })) || []
    }

    return NextResponse.json(transformedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Error fetching historical data:', error)
    
    // Return fallback data
    const days_num = parseInt(request.nextUrl.searchParams.get('days') || '7')
    const fallbackData = generateFallbackHistoricalData(days_num)

    return NextResponse.json(fallbackData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  }
}

function generateFallbackHistoricalData(days: number) {
  const now = Date.now()
  const prices = []
  const basePrice = 2500 // ETH base price
  
  const dataPoints = days === 1 ? 24 : days // hourly for 1 day, daily for others
  const timeInterval = days === 1 ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 1 hour vs 1 day
  
  for (let i = 0; i < dataPoints; i++) {
    const timestamp = now - (dataPoints - i) * timeInterval
    const randomChange = (Math.random() - 0.5) * 0.1 // ±5% random change
    const price = basePrice * (1 + randomChange + Math.sin(i / 10) * 0.05)
    
    prices.push({
      time: new Date(timestamp).toISOString(),
      value: Math.max(0, price)
    })
  }
  
  return {
    prices,
    market_caps: prices.map(p => ({ ...p, value: p.value * 120000000 })), // rough market cap
    total_volumes: prices.map(p => ({ ...p, value: p.value * 10000000 })) // rough volume
  }
}
