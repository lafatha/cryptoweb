"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAccount } from 'wagmi'

export interface TokenBalance {
  symbol: string
  name: string
  balance: string
  decimals: number
  address: string
  price?: number
  priceChange24h?: number
  marketValue?: number
  costBasis?: number
  roi?: number
  sparklineData?: { time: string; value: number }[]
  isManual?: boolean
  manualEntryId?: string
  notes?: string
}

export interface PortfolioData {
  totalValue: number
  totalValueChange: number
  holdings: TokenBalance[]
  chartData: { time: string; value: number }[]
  isLoadingChart: boolean
  lastUpdated?: string
}

interface PortfolioContextType {
  portfolioData: PortfolioData | null
  setPortfolioData: (data: PortfolioData | null) => void
  coinPrices: Record<string, any>
  setCoinPrices: (prices: Record<string, any>) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  refreshPortfolio: () => void
  refreshKey: number
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined)

const PORTFOLIO_STORAGE_KEY = 'crypto-dashboard-portfolio-cache'
const PRICES_STORAGE_KEY = 'crypto-dashboard-prices-cache'
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes for faster updates

interface PortfolioProviderProps {
  children: ReactNode
}

export function PortfolioProvider({ children }: PortfolioProviderProps) {
  const { address, isConnected } = useAccount()
  const [portfolioData, setPortfolioDataState] = useState<PortfolioData | null>(null)
  const [coinPrices, setCoinPricesState] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Load cached data on mount
  useEffect(() => {
    loadCachedData()
  }, [])

  // Save data when it changes
  useEffect(() => {
    if (portfolioData) {
      savePortfolioCache(portfolioData)
    }
  }, [portfolioData])

  useEffect(() => {
    if (Object.keys(coinPrices).length > 0) {
      savePricesCache(coinPrices)
    }
  }, [coinPrices])

  const loadCachedData = () => {
    try {
      // Load portfolio cache
      const portfolioCache = localStorage.getItem(PORTFOLIO_STORAGE_KEY)
      if (portfolioCache) {
        const { data, timestamp } = JSON.parse(portfolioCache)
        const isExpired = Date.now() - timestamp > CACHE_DURATION
        
        if (!isExpired && data) {
          setPortfolioDataState(data)
        }
      }

      // Load prices cache
      const pricesCache = localStorage.getItem(PRICES_STORAGE_KEY)
      if (pricesCache) {
        const { data, timestamp } = JSON.parse(pricesCache)
        const isExpired = Date.now() - timestamp > CACHE_DURATION
        
        if (!isExpired && data) {
          setCoinPricesState(data)
        }
      }
    } catch (error) {
      console.error('Error loading cached data:', error)
    }
  }

  const savePortfolioCache = (data: PortfolioData) => {
    try {
      const cache = {
        data: { ...data, lastUpdated: new Date().toISOString() },
        timestamp: Date.now()
      }
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(cache))
    } catch (error) {
      console.error('Error saving portfolio cache:', error)
    }
  }

  const savePricesCache = (data: Record<string, any>) => {
    try {
      const cache = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(PRICES_STORAGE_KEY, JSON.stringify(cache))
    } catch (error) {
      console.error('Error saving prices cache:', error)
    }
  }

  const setPortfolioData = (data: PortfolioData | null) => {
    setPortfolioDataState(data)
  }

  const setCoinPrices = (prices: Record<string, any>) => {
    setCoinPricesState(prices)
  }

  const refreshPortfolio = () => {
    setRefreshKey(prev => prev + 1)
    // Clear cache to force fresh data
    localStorage.removeItem(PORTFOLIO_STORAGE_KEY)
    localStorage.removeItem(PRICES_STORAGE_KEY)
  }

  const value: PortfolioContextType = {
    portfolioData,
    setPortfolioData,
    coinPrices,
    setCoinPrices,
    loading,
    setLoading,
    refreshPortfolio,
    refreshKey
  }

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const context = useContext(PortfolioContext)
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider')
  }
  return context
}
