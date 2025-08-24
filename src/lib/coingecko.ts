const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

export interface MarketTicker {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_24h: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency: number
  total_volume: number
  market_cap: number
  market_cap_rank: number
  last_updated: string
}

export interface CandleData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface HistoricalData {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

// Server-side fetch with defensive error handling
async function fetchCoinGecko(endpoint: string, options?: RequestInit): Promise<any> {
  try {
    const url = `${COINGECKO_API_BASE}${endpoint}`
    const response = await fetch(url, {
      ...options,
      next: { revalidate: 60 }, // Cache for 1 minute
      headers: {
        'Accept': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Invalid response format: expected JSON, got ${contentType}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('CoinGecko fetch error:', error)
    throw error
  }
}

/**
 * Get market data for specified coin IDs
 */
export async function getMarketTickers(
  ids: string[] = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'matic-network', 'ripple'],
  vs_currency = 'usd'
): Promise<MarketTicker[]> {
  try {
    const endpoint = `/coins/markets?ids=${ids.join(',')}&vs_currency=${vs_currency}&order=market_cap_desc&per_page=${ids.length}&page=1&sparkline=false&price_change_percentage=24h,7d`
    
    const data = await fetchCoinGecko(endpoint)
    
    // Validate response structure
    if (!Array.isArray(data)) {
      throw new Error('Invalid market data format')
    }

    return data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price || 0,
      price_change_24h: coin.price_change_24h || 0,
      price_change_percentage_24h: coin.price_change_percentage_24h || 0,
      price_change_percentage_7d_in_currency: coin.price_change_percentage_7d_in_currency || 0,
      total_volume: coin.total_volume || 0,
      market_cap: coin.market_cap || 0,
      market_cap_rank: coin.market_cap_rank || 0,
      last_updated: coin.last_updated || new Date().toISOString(),
    }))
  } catch (error) {
    console.error('Error fetching market tickers:', error)
    // Return fallback data
    return getFallbackMarketData(ids)
  }
}

/**
 * Get historical price data for candlestick charts
 */
export async function getCandles(
  id: string,
  days: number = 7,
  vs_currency = 'usd'
): Promise<CandleData[]> {
  try {
    const endpoint = `/coins/${id}/market_chart?vs_currency=${vs_currency}&days=${days}&interval=${days <= 1 ? 'hourly' : 'daily'}`
    
    const data: HistoricalData = await fetchCoinGecko(endpoint)
    
    if (!data.prices || !Array.isArray(data.prices)) {
      throw new Error('Invalid candle data format')
    }

    // Convert price data to OHLCV format
    const candles: CandleData[] = []
    const chunkSize = days <= 1 ? 4 : 1 // Group hourly data into 4-hour candles for daily view
    
    for (let i = 0; i < data.prices.length; i += chunkSize) {
      const chunk = data.prices.slice(i, i + chunkSize)
      if (chunk.length === 0) continue
      
      const timestamp = chunk[0][0]
      const prices = chunk.map(([_, price]) => price)
      const volumes = data.total_volumes.slice(i, i + chunkSize).map(([_, vol]) => vol)
      
      candles.push({
        timestamp,
        open: prices[0],
        high: Math.max(...prices),
        low: Math.min(...prices),
        close: prices[prices.length - 1],
        volume: volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length,
      })
    }
    
    return candles
  } catch (error) {
    console.error('Error fetching candle data:', error)
    return getFallbackCandleData(id, days)
  }
}

/**
 * Get simple price data for multiple coins
 */
export async function getSimplePrices(
  ids: string[],
  vs_currencies = ['usd'],
  include_24hr_change = true
): Promise<Record<string, any>> {
  try {
    const endpoint = `/simple/price?ids=${ids.join(',')}&vs_currencies=${vs_currencies.join(',')}&include_24hr_change=${include_24hr_change}`
    
    return await fetchCoinGecko(endpoint)
  } catch (error) {
    console.error('Error fetching simple prices:', error)
    return getFallbackSimplePrices(ids)
  }
}

// Fallback data for when API fails
function getFallbackMarketData(ids: string[]): MarketTicker[] {
  const fallbackData: Record<string, Partial<MarketTicker>> = {
    bitcoin: {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      current_price: 43250,
      price_change_percentage_24h: 2.5,
      price_change_percentage_7d_in_currency: 5.2,
      market_cap: 847000000000,
      total_volume: 15000000000,
      market_cap_rank: 1,
    },
    ethereum: {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      current_price: 2580,
      price_change_percentage_24h: -1.2,
      price_change_percentage_7d_in_currency: 3.1,
      market_cap: 310000000000,
      total_volume: 8000000000,
      market_cap_rank: 2,
    },
    solana: {
      id: 'solana',
      symbol: 'sol',
      name: 'Solana',
      current_price: 102,
      price_change_percentage_24h: 4.8,
      price_change_percentage_7d_in_currency: 12.3,
      market_cap: 45000000000,
      total_volume: 2000000000,
      market_cap_rank: 5,
    },
  }

  return ids.map(id => ({
    id,
    symbol: fallbackData[id]?.symbol || id,
    name: fallbackData[id]?.name || id,
    image: `https://assets.coingecko.com/coins/images/1/large/${id}.png`,
    current_price: fallbackData[id]?.current_price || 1,
    price_change_24h: fallbackData[id]?.current_price ? (fallbackData[id]?.current_price! * (fallbackData[id]?.price_change_percentage_24h || 0) / 100) : 0,
    price_change_percentage_24h: fallbackData[id]?.price_change_percentage_24h || 0,
    price_change_percentage_7d_in_currency: fallbackData[id]?.price_change_percentage_7d_in_currency || 0,
    total_volume: fallbackData[id]?.total_volume || 0,
    market_cap: fallbackData[id]?.market_cap || 0,
    market_cap_rank: fallbackData[id]?.market_cap_rank || 999,
    last_updated: new Date().toISOString(),
  }))
}

function getFallbackCandleData(id: string, days: number): CandleData[] {
  const now = Date.now()
  const candles: CandleData[] = []
  const basePrice = 100 // Fallback base price
  
  for (let i = 0; i < days * 24; i++) {
    const timestamp = now - (days * 24 - i) * 60 * 60 * 1000
    const variation = (Math.random() - 0.5) * 0.1
    const price = basePrice * (1 + variation)
    
    candles.push({
      timestamp,
      open: price * 0.98,
      high: price * 1.02,
      low: price * 0.96,
      close: price,
      volume: Math.random() * 1000000,
    })
  }
  
  return candles
}

function getFallbackSimplePrices(ids: string[]): Record<string, any> {
  const fallback: Record<string, any> = {}
  
  ids.forEach(id => {
    fallback[id] = {
      usd: Math.random() * 1000,
      usd_24h_change: (Math.random() - 0.5) * 10,
    }
  })
  
  return fallback
}

// Utility functions
export function formatCurrency(
  amount: number,
  currency = 'USD',
  minimumFractionDigits = 2,
  maximumFractionDigits = 8
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: amount < 1 ? 4 : minimumFractionDigits,
    maximumFractionDigits: amount < 1 ? 8 : maximumFractionDigits,
  }).format(amount)
}

export function formatPercentage(percentage: number): string {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
}

export function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
  return num.toFixed(2)
}
