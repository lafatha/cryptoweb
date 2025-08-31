import axios from 'axios'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

export interface CryptoPrice {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  roi: any
  last_updated: string
}

export interface HistoricalPrice {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

export interface GlobalMarketData {
  data: {
    active_cryptocurrencies: number
    upcoming_icos: number
    ongoing_icos: number
    ended_icos: number
    markets: number
    total_market_cap: Record<string, number>
    total_volume: Record<string, number>
    market_cap_percentage: Record<string, number>
    market_cap_change_percentage_24h_usd: number
    updated_at: number
  }
}

class CoinGeckoAPI {
  private api = axios.create({
    baseURL: COINGECKO_API_BASE,
    timeout: 10000,
  })

  /**
   * Get list of cryptocurrencies with market data
   */
  async getMarkets(
    vs_currency = 'usd',
    order = 'market_cap_desc',
    per_page = 100,
    page = 1,
    sparkline = false,
    price_change_percentage = '24h'
  ): Promise<CryptoPrice[]> {
    try {
      const response = await this.api.get('/coins/markets', {
        params: {
          vs_currency,
          order,
          per_page,
          page,
          sparkline,
          price_change_percentage,
        },
      })
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid or empty response from CoinGecko API')
      }
      return response.data
    } catch (error) {
      console.error('Error fetching market data:', error)
      throw error
    }
  }

  /**
   * Get specific coins by IDs
   */
  async getCoinsByIds(
    ids: string[],
    vs_currency = 'usd',
    include_market_cap = true,
    include_24hr_vol = true,
    include_24hr_change = true
  ): Promise<CryptoPrice[]> {
    try {
      const response = await this.api.get('/coins/markets', {
        params: {
          ids: ids.join(','),
          vs_currency,
          include_market_cap,
          include_24hr_vol,
          include_24hr_change,
        },
      })
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid or empty response from CoinGecko API')
      }
      return response.data
    } catch (error) {
      console.error('Error fetching specific coins:', error)
      throw error
    }
  }

  /**
   * Get simple price for specific coins
   */
  async getSimplePrice(
    ids: string[],
    vs_currencies = ['usd'],
    include_market_cap = false,
    include_24hr_vol = false,
    include_24hr_change = true,
    include_last_updated_at = false
  ): Promise<Record<string, any>> {
    try {
      const response = await this.api.get('/simple/price', {
        params: {
          ids: ids.join(','),
          vs_currencies: vs_currencies.join(','),
          include_market_cap,
          include_24hr_vol,
          include_24hr_change,
          include_last_updated_at,
        },
      })
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid or empty response from CoinGecko API')
      }
      return response.data
    } catch (error) {
      console.error('Error fetching simple prices:', error)
      throw error
    }
  }

  /**
   * Get historical market data for a coin
   */
  async getHistoricalData(
    id: string,
    vs_currency = 'usd',
    days = 7,
    interval?: string
  ): Promise<HistoricalPrice> {
    try {
      const response = await this.api.get(`/coins/${id}/market_chart`, {
        params: {
          vs_currency,
          days,
          interval,
        },
      })
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid or empty response from CoinGecko API')
      }
      return response.data
    } catch (error) {
      console.error('Error fetching historical data:', error)
      throw error
    }
  }

  /**
   * Get global cryptocurrency market data
   */
  async getGlobalData(): Promise<GlobalMarketData> {
    try {
      const response = await this.api.get('/global')
      return response.data
    } catch (error) {
      console.error('Error fetching global data:', error)
      throw error
    }
  }

  /**
   * Get trending coins
   */
  async getTrending(): Promise<any> {
    try {
      const response = await this.api.get('/search/trending')
      return response.data
    } catch (error) {
      console.error('Error fetching trending coins:', error)
      throw error
    }
  }

  /**
   * Search for coins
   */
  async searchCoins(query: string): Promise<any> {
    try {
      const response = await this.api.get('/search', {
        params: { query },
      })
      return response.data
    } catch (error) {
      console.error('Error searching coins:', error)
      throw error
    }
  }
}

// Create a singleton instance
export const coinGeckoAPI = new CoinGeckoAPI()

// Popular crypto IDs for quick access
export const POPULAR_CRYPTO_IDS = [
  'bitcoin',
  'ethereum',
  'solana',
  'cardano',
  'polkadot',
  'chainlink',
  'polygon',
  'avalanche-2',
  'uniswap',
  'litecoin',
]

// Utility function to format currency
export const formatCurrency = (
  amount: number,
  currency = 'USD',
  minimumFractionDigits = 2,
  maximumFractionDigits = 8
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: amount < 1 ? 4 : minimumFractionDigits,
    maximumFractionDigits: amount < 1 ? 8 : maximumFractionDigits,
  }).format(amount)
}

// Utility function to format percentage
export const formatPercentage = (percentage: number): string => {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
}

// Utility function to format market cap/volume
export const formatLargeNumber = (num: number): string => {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
  return num.toFixed(2)
}
