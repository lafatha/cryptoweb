import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { coinGeckoAPI, CryptoPrice, POPULAR_CRYPTO_IDS } from '@/lib/api/coingecko'

// Custom hook for crypto market data
export function useCryptoMarkets(page = 1, perPage = 100) {
  const { data, error, isLoading, mutate } = useSWR(
    ['crypto-markets', page, perPage],
    () => coinGeckoAPI.getMarkets('usd', 'market_cap_desc', perPage, page),
    {
      refreshInterval: 15000, // Refresh every 15 seconds for faster updates
      revalidateOnFocus: false, // Prevent unnecessary refetches
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      errorRetryCount: 3,
      errorRetryInterval: 2000,
    }
  )

  return {
    data: data || [],
    error,
    isLoading,
    refetch: mutate,
  }
}

// Custom hook for specific cryptocurrencies
export function usePopularCryptos() {
  const { data, error, isLoading, mutate } = useSWR(
    'popular-cryptos',
    () => coinGeckoAPI.getCoinsByIds(POPULAR_CRYPTO_IDS),
    {
      refreshInterval: 10000, // Refresh every 10 seconds for faster updates
      revalidateOnFocus: false, // Prevent unnecessary refetches
      dedupingInterval: 3000, // Dedupe requests within 3 seconds
      errorRetryCount: 3,
      errorRetryInterval: 1500,
    }
  )

  return {
    data: data || [],
    error,
    isLoading,
    refetch: mutate,
  }
}

// Custom hook for ticker data (used in market ticker)
export function useTickerData() {
  const { data, error, isLoading } = useSWR(
    'ticker-data',
    () => coinGeckoAPI.getCoinsByIds(POPULAR_CRYPTO_IDS.slice(0, 8)),
    {
      refreshInterval: 8000, // Refresh every 8 seconds for faster ticker updates
      revalidateOnFocus: false, // Prevent unnecessary refetches
      dedupingInterval: 2000, // Dedupe requests within 2 seconds
      errorRetryCount: 2,
      errorRetryInterval: 1000,
    }
  )

  return {
    data: data || [],
    error,
    isLoading,
  }
}

// Custom hook for historical price data
export function useHistoricalData(coinId: string, days = 7) {
  const { data, error, isLoading } = useSWR(
    coinId ? ['historical-data', coinId, days] : null,
    () => coinGeckoAPI.getHistoricalData(coinId, 'usd', days),
    {
      refreshInterval: 300000, // Refresh every 5 minutes for historical data
    }
  )

  return {
    data,
    error,
    isLoading,
  }
}

// Custom hook for global market data
export function useGlobalMarketData() {
  const { data, error, isLoading } = useSWR(
    'global-market-data',
    () => coinGeckoAPI.getGlobalData(),
    {
      refreshInterval: 60000, // Refresh every minute
    }
  )

  return {
    data,
    error,
    isLoading,
  }
}

// Custom hook for trending coins
export function useTrendingCoins() {
  const { data, error, isLoading } = useSWR(
    'trending-coins',
    () => coinGeckoAPI.getTrending(),
    {
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  )

  return {
    data,
    error,
    isLoading,
  }
}

// Custom hook for simple price data (for quick updates)
export function useSimplePrices(coinIds: string[]) {
  const { data, error, isLoading, mutate } = useSWR(
    coinIds.length > 0 ? ['simple-prices', coinIds.join(',')] : null,
    () => coinGeckoAPI.getSimplePrice(coinIds, ['usd'], false, false, true),
    {
      refreshInterval: 3000, // Very frequent updates for price monitoring (3 seconds)
      revalidateOnFocus: false, // Prevent unnecessary refetches
      dedupingInterval: 1000, // Dedupe requests within 1 second
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  )

  return {
    data: data || {},
    error,
    isLoading,
    refetch: mutate,
  }
}

// Custom hook with fallback data for development/demo
export function useCryptoDataWithFallback() {
  const [useRealData, setUseRealData] = useState(true)
  const { data: realData, error, isLoading } = useCryptoMarkets()

  // Fallback mock data for development
  const mockData: CryptoPrice[] = [
    {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      current_price: 43250.00,
      market_cap: 847500000000,
      market_cap_rank: 1,
      fully_diluted_valuation: 907500000000,
      total_volume: 12500000000,
      high_24h: 44100,
      low_24h: 42800,
      price_change_24h: 1234.56,
      price_change_percentage_24h: 2.94,
      market_cap_change_24h: 24500000000,
      market_cap_change_percentage_24h: 2.98,
      circulating_supply: 19600000,
      total_supply: 21000000,
      max_supply: 21000000,
      ath: 69045,
      ath_change_percentage: -37.4,
      ath_date: '2021-11-10T14:24:11.849Z',
      atl: 67.81,
      atl_change_percentage: 63665.2,
      atl_date: '2013-07-06T00:00:00.000Z',
      roi: null,
      last_updated: new Date().toISOString(),
    },
    // Add more mock data as needed...
  ]

  // Switch to mock data if real data fails
  useEffect(() => {
    if (error && useRealData) {
      console.warn('CoinGecko API failed, switching to mock data:', error)
      setUseRealData(false)
    }
  }, [error, useRealData])

  return {
    data: useRealData && !error ? realData : mockData,
    error: useRealData ? error : null,
    isLoading: useRealData ? isLoading : false,
    isUsingMockData: !useRealData,
  }
}
