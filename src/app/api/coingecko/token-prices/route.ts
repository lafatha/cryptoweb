import { NextResponse } from 'next/server'

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const platform = url.searchParams.get('platform')
  const contractAddresses = url.searchParams.get('contract_addresses')
  const vsCurrencies = url.searchParams.get('vs_currencies') || 'usd'
  const include24hrChange = url.searchParams.get('include_24hr_change') === 'true'

  if (!platform || !contractAddresses) {
    return NextResponse.json(
      { error: 'Missing required parameters: platform, contract_addresses' },
      { status: 400 }
    )
  }

  try {
    // Build CoinGecko API URL
    const cgUrl = new URL(`https://api.coingecko.com/api/v3/simple/token_price/${platform}`)
    cgUrl.searchParams.set('contract_addresses', contractAddresses)
    cgUrl.searchParams.set('vs_currencies', vsCurrencies)
    
    if (include24hrChange) {
      cgUrl.searchParams.set('include_24hr_change', 'true')
    }

    const response = await fetch(cgUrl.toString(), {
      headers: {
        'Accept': 'application/json'
      },
      // Cache for 30 seconds
      next: { revalidate: 30 }
    })

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: 'Failed to fetch token prices' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    })

  } catch (error) {
    console.error('Token prices API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
