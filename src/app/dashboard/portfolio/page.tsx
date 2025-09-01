"use client"

import { useState, useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { usePortfolio } from '@/contexts/portfolio-context'
import { motion } from "framer-motion"
import { formatUnits, parseAbi } from 'viem'
import { readContracts } from 'wagmi/actions'
import { config } from '@/lib/wagmi'
import { 
  aggregateTokenHoldings, 
  calculatePortfolioTotals, 
  calculateMarketValue, 
  formatTokenBalance,
  formatCurrency,
  calculateROI
} from '@/lib/portfolio-utils'
import { 
  fetchSimplePricesWithFallback,
  normalizeTokenSymbol,
  getCoinGeckoIdFromSymbol
} from '@/lib/pricing'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ExternalLink,
  RefreshCw,
  Plus,
  AlertCircle,
  Network,

} from "lucide-react"

import { WalletConnectModal } from "@/components/WalletConnectModal"
import { CryptoIcon } from "@/components/crypto-icon"

import { ManualPortfolioModal, type ManualPortfolioEntry } from "@/components/manual-portfolio-modal"
import { 
  getManualPortfolioEntries, 
  addManualPortfolioEntry, 
  enrichManualEntriesWithPricing,
  convertManualEntriesToTokenBalance,
  getTokenIdsFromManualEntries,
  removeManualPortfolioEntry
} from "@/lib/manual-portfolio"
import { 
  saveWalletConnection,
  disconnectWallet,
  getWalletPortfolio,
  addAssetToWalletPortfolio,
  removeAssetFromWalletPortfolio,
  type WalletPortfolio
} from "@/lib/wallet-portfolio"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts'

// ERC20 ABI untuk membaca balance dan decimals
const ERC20_ABI = parseAbi([
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
])

// Common ERC20 tokens pada Ethereum mainnet
const COMMON_TOKENS = [
  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6, coinGeckoId: 'tether' },
  { address: '0xA0b86a33E6441986C3df53b1B8c6A0D8c08bDD4e', symbol: 'USDC', name: 'USD Coin', decimals: 6, coinGeckoId: 'usd-coin' },
  { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', symbol: 'LINK', name: 'Chainlink', decimals: 18, coinGeckoId: 'chainlink' },
  { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap', decimals: 18, coinGeckoId: 'uniswap' },
]

interface TokenBalance {
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

interface PortfolioData {
  totalValue: number
  totalValueChange: number
  holdings: TokenBalance[]
  chartData: { time: string; value: number }[]
  isLoadingChart: boolean
}



const formatTokenAmount = (amount: string, decimals: number) => {
  const value = parseFloat(formatTokenBalance(amount, decimals, 5))
  if (value < 0.0001) return '< 0.0001'
  if (value < 1) return value.toFixed(6)
  if (value < 100) return value.toFixed(4)
  return value.toFixed(2)
}

export default function DashboardPortfolioPage() {
  const { address, isConnected, chain } = useAccount()
  const { data: ethBalance } = useBalance({ address })
  const { 
    portfolioData, 
    setPortfolioData, 
    coinPrices, 
    setCoinPrices, 
    loading, 
    setLoading,
    refreshPortfolio,
    refreshKey
  } = usePortfolio()
  
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('90D')
  const [selectedAsset, setSelectedAsset] = useState<TokenBalance | null>(null)
  const [chartLoading, setChartLoading] = useState(false)

  const [showManualEntryModal, setShowManualEntryModal] = useState(false)
  const [manualEntries, setManualEntries] = useState<ManualPortfolioEntry[]>([])
  const [walletPortfolio, setWalletPortfolio] = useState<WalletPortfolio[]>([])
  const [isWalletSaved, setIsWalletSaved] = useState(false)

  // Load manual entries on component mount
  useEffect(() => {
    setManualEntries(getManualPortfolioEntries())
  }, [refreshKey])

  // Handle wallet connection and save to database
  useEffect(() => {
    if (isConnected && address) {
      // Save wallet connection to database
      saveWalletConnection(address, 'metamask').then((saved) => {
        setIsWalletSaved(!!saved)
        if (saved) {
          // Load wallet portfolio from database
          getWalletPortfolio(address).then(setWalletPortfolio)
        }
      }).catch((error) => {
        console.error('Failed to save wallet connection:', error)
        setIsWalletSaved(false)
      })
    } else {
      // Reset wallet portfolio when disconnected
      setWalletPortfolio([])
      setIsWalletSaved(false)
    }
  }, [isConnected, address])

  // Fetch portfolio data when wallet is connected or manual entries change
  useEffect(() => {
    if (isConnected && address) {
      fetchPortfolioData()
    } else if (manualEntries.length > 0) {
      // If wallet not connected but we have manual entries, still fetch coin prices
      fetchPortfolioData()
    }
  }, [isConnected, address, chain, manualEntries, refreshKey])

  // Fetch coin prices
  useEffect(() => {
    fetchCoinPrices()
    const interval = setInterval(fetchCoinPrices, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Fetch historical data when timeframe changes
  useEffect(() => {
    if (isConnected && address && portfolioData) {
      fetchHistoricalData()
    }
  }, [selectedTimeframe, isConnected, address])

  const fetchHistoricalData = async () => {
    if (!portfolioData) return
    
    setChartLoading(true)
    try {
      // Convert timeframe to days
      const daysMap: Record<string, string> = {
        '24H': '1',
        '7D': '7',
        '30D': '30',
        '90D': '90'
      }
      
      const days = daysMap[selectedTimeframe] || '90'
      
      // For now, we'll use ETH as the main indicator for portfolio
      // In a real app, you'd calculate portfolio value based on all holdings
      const response = await fetch(`/api/coingecko/historical?coinId=ethereum&days=${days}&vs_currency=usd`)
      
      if (response.ok) {
        const data = await response.json()
        
        // Calculate portfolio chart data based on current portfolio composition
        const totalValue = portfolioData.totalValue
        const ethPrice = coinPrices.ethereum?.usd || 2500
        const ethHolding = portfolioData.holdings.find(h => h.symbol === 'ETH')
        const ethRatio = ethHolding ? (ethHolding.marketValue || 0) / totalValue : 0.7 // Default 70% ETH if no holdings
        
        const chartData = data.prices.map((point: any) => ({
          time: point.time,
          value: totalValue * (point.value / ethPrice) * ethRatio + totalValue * (1 - ethRatio) // Simplified calculation
        }))
        
        if (portfolioData) {
          setPortfolioData({
            ...portfolioData,
            chartData,
            isLoadingChart: false
          })
        }
      }
    } catch (error) {
      console.error('Error fetching historical data:', error)
      // Use fallback generated data
      if (portfolioData) {
        setPortfolioData({
          ...portfolioData,
          chartData: generateChartData(portfolioData.totalValue, portfolioData.totalValueChange, selectedTimeframe),
          isLoadingChart: false
        })
      }
    } finally {
      setChartLoading(false)
    }
  }

  const fetchCoinPrices = async () => {
    try {
      // Get token IDs from both wallet tokens and manual entries
      const walletTokens = [
        'ethereum', // ETH
        ...COMMON_TOKENS.map(token => (token as any).coinGeckoId).filter(Boolean), // ERC20 tokens
        'bitcoin', 'solana', 'cardano', 'polkadot', 'avalanche-2', 'matic-network' // Popular assets for manual entries
      ]
      const manualTokenIds = getTokenIdsFromManualEntries(manualEntries)
      const allTokenIds = [...new Set([...walletTokens, ...manualTokenIds])]
      
      // Use enhanced pricing with fallback handling
      const priceData = await fetchSimplePricesWithFallback(allTokenIds, true)
      
      // Convert null values back to the expected format for backward compatibility
      const compatibleData: Record<string, any> = {}
      Object.entries(priceData).forEach(([tokenId, price]) => {
        if (price !== null) {
          compatibleData[tokenId] = price
        }
        // If price is null, we simply don't include it, which will be handled gracefully
      })
      
      setCoinPrices(compatibleData)
    } catch (error) {
      console.error('Error fetching coin prices:', error)
    }
  }

  const fetchPortfolioData = async () => {
    setLoading(true)
    try {
      const holdings: TokenBalance[] = []
      
      // Add ETH balance if wallet is connected
      if (ethBalance && isConnected && address) {
        const ethPrice = coinPrices.ethereum?.usd || 2500
        const ethAmount = parseFloat(ethBalance.formatted)
        const ethMarketValue = ethAmount * ethPrice
        
        holdings.push({
          symbol: 'ETH',
          name: 'Ethereum',
          balance: ethBalance.value.toString(),
          decimals: 18,
          address: 'native',
          price: ethPrice,
          priceChange24h: coinPrices.ethereum?.usd_24h_change || 0,
          marketValue: ethMarketValue,
          sparklineData: generateSparklineData(ethPrice, coinPrices.ethereum?.usd_24h_change || 0)
        })
      }

      // Fetch ERC20 token balances if wallet is connected
      if (isConnected && address) {
        try {
        const tokenContracts = COMMON_TOKENS.map(token => [
          {
            address: token.address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address]
          },
          {
            address: token.address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'decimals'
          }
        ]).flat()

        const results = await readContracts(config, {
          contracts: tokenContracts as any
        })

        for (let i = 0; i < COMMON_TOKENS.length; i++) {
          const token = COMMON_TOKENS[i]
          const balanceResult = results[i * 2]
          const decimalsResult = results[i * 2 + 1]

          if (balanceResult.status === 'success' && typeof balanceResult.result === 'bigint' && balanceResult.result > BigInt(0)) {
            const decimals = decimalsResult.status === 'success' ? Number(decimalsResult.result) : token.decimals
            // Use the token's coinGeckoId if available, fallback to symbol mapping
            const priceKey = (token as any).coinGeckoId || getCoinGeckoIdFromSymbol(token.symbol)
            
            const price = priceKey ? coinPrices[priceKey]?.usd || null : null
            const priceChange = priceKey ? coinPrices[priceKey]?.usd_24h_change || null : null
            const balance = formatUnits(balanceResult.result as bigint, decimals)
            const marketValue = price ? parseFloat(balance) * price : undefined
            
            holdings.push({
              symbol: token.symbol,
              name: token.name,
              balance: balanceResult.result.toString(),
              decimals,
              address: token.address,
              price,
              priceChange24h: priceChange,
              marketValue,
              sparklineData: generateSparklineData(price, priceChange)
            })
          }
        }
              } catch (error) {
          console.error('Error fetching token balances:', error)
        }
      }

      // Add manual portfolio entries
      const enrichedManualEntries = enrichManualEntriesWithPricing(manualEntries, coinPrices)
      const manualHoldings = convertManualEntriesToTokenBalance(enrichedManualEntries)
      holdings.push(...manualHoldings)

      // Aggregate duplicate tokens and calculate proper totals
      const aggregatedHoldings = aggregateTokenHoldings(holdings)
      
      // Recalculate market values and ROI for aggregated holdings
      const finalHoldings = aggregatedHoldings.map(holding => {
        const marketValue = holding.price ? 
          calculateMarketValue(holding.balance, holding.decimals, holding.price) : 
          holding.marketValue || 0
        
        const roi = holding.costBasis ? 
          calculateROI(marketValue, holding.costBasis, holding.balance, holding.decimals) : 
          holding.roi

        return {
          ...holding,
          marketValue,
          roi
        }
      })

      const { totalValue, totalValueChange } = calculatePortfolioTotals(finalHoldings)

      setPortfolioData({
        totalValue,
        totalValueChange,
        holdings: finalHoldings,
        chartData: generateChartData(totalValue, totalValueChange, selectedTimeframe),
        isLoadingChart: false
      })
    } catch (error) {
      console.error('Error fetching portfolio data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateChartData = (currentValue: number, change: number, timeframe: string) => {
    const points = timeframe === '24H' ? 24 : timeframe === '7D' ? 7 : timeframe === '30D' ? 30 : 90
    const data = []
    const changePerPoint = change / points
    
    for (let i = 0; i < points; i++) {
      const value = currentValue - change + (changePerPoint * i) + (Math.random() - 0.5) * currentValue * 0.02
      data.push({
        time: new Date(Date.now() - (points - i) * (timeframe === '24H' ? 3600000 : 86400000)).toISOString(),
        value: Math.max(0, value)
      })
    }
    
    return data
  }

  const generateSparklineData = (price: number, change: number) => {
    const data = []
    for (let i = 0; i < 24; i++) {
      const hourlyChange = change / 24
      const value = price - change + (hourlyChange * i) + (Math.random() - 0.5) * price * 0.01
      data.push({
        time: new Date(Date.now() - (24 - i) * 3600000).toISOString(),
        value: Math.max(0, value)
      })
    }
    return data
  }

  const handleAddManualEntry = async (entry: Omit<ManualPortfolioEntry, 'id' | 'createdAt'>) => {
    try {
      if (isConnected && address) {
        // Save to wallet portfolio in database
        const saved = await addAssetToWalletPortfolio(
          address,
          entry.symbol,
          entry.amount,
          entry.buyPrice,
          entry.notes
        )
        if (saved) {
          // Refresh wallet portfolio
          const portfolio = await getWalletPortfolio(address)
          setWalletPortfolio(portfolio)
        }
      } else {
        // Fallback to local storage for non-connected users
        addManualPortfolioEntry(entry)
      }
      refreshPortfolio() // Trigger refresh using context
    } catch (error) {
      console.error('Error adding manual portfolio entry:', error)
      throw error
    }
  }

  const handleRemoveManualEntry = async (entryId: string) => {
    try {
      if (isConnected && address) {
        // Remove from wallet portfolio in database
        const removed = await removeAssetFromWalletPortfolio(address, entryId)
        if (removed) {
          // Refresh wallet portfolio
          const portfolio = await getWalletPortfolio(address)
          setWalletPortfolio(portfolio)
        }
      } else {
        // Fallback to local storage for non-connected users
        removeManualPortfolioEntry(entryId)
      }
      refreshPortfolio() // Trigger refresh using context
    } catch (error) {
      console.error('Error removing manual portfolio entry:', error)
    }
  }

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 space-y-6"
    >
      <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
        <Wallet className="h-12 w-12 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Connect MetaMask</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Connect your MetaMask wallet to view your cryptocurrency portfolio and track asset values in real-time.
        </p>
      </div>
    </motion.div>
  )

  const WalletNotConnectedMessage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-[60vh] flex items-center justify-center"
    >
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="w-32 h-32 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Wallet className="h-16 w-16 text-gray-400 dark:text-gray-500" />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-black dark:text-white">Connect Your Wallet</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            To view your portfolio, please connect your wallet using the "Connect Wallet" button in the top navigation.
          </p>
        </div>
        <div className="pt-4">
          <Button 
            onClick={() => setShowWalletModal(true)}
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-2xl px-8 py-3"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </div>
      </div>
    </motion.div>
  )

  const NetworkWarning = () => {
    if (!chain || chain.id === 1) return null
    
    return (
      <Card className="border-gray-200 bg-gray-50 dark:bg-gray-900/50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-gray-500" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Network not fully supported
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                You're connected to {chain.name}. For full portfolio tracking, please switch to Ethereum Mainnet.
              </p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              <Network className="h-4 w-4 mr-2" />
              Switch Network
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show "Please connect wallet" message when no wallet is connected
  if (!isConnected) {
    return (
      <>
        <WalletConnectModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onEmailClick={() => {
            setShowWalletModal(false)
            window.location.href = '/auth/signin'
          }}
        />
        <div className="p-6">
          <WalletNotConnectedMessage />
        </div>
        

      </>
    )
  }

  return (
    <>
      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onEmailClick={() => {
          setShowWalletModal(false)
          window.location.href = '/auth/signin'
        }}
      />
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
            <p className="text-muted-foreground">
              Track your cryptocurrency portfolio and monitor performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { refreshPortfolio(); fetchPortfolioData(); }} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        <NetworkWarning />

        {/* Portfolio Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Portfolio Value</CardTitle>
                  <CardDescription>Total value across all assets</CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  {['24H', '7D', '30D', '90D'].map((period) => (
                    <Button
                      key={period}
                      variant={selectedTimeframe === period ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setSelectedTimeframe(period)
                        if (portfolioData) {
                          fetchHistoricalData()
                        }
                      }}
                      className="text-xs"
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : portfolioData ? (
                <>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold">
                        ${formatCurrency(portfolioData.totalValue)}
                      </div>
                      <div className="flex items-center gap-2">
                        {portfolioData.totalValueChange >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                        )}
                        <span className={`text-sm font-medium ${
                          portfolioData.totalValueChange >= 0 ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {portfolioData.totalValueChange >= 0 ? '+' : ''}
                          ${formatCurrency(Math.abs(portfolioData.totalValueChange))} (
                          {((portfolioData.totalValueChange / (portfolioData.totalValue - portfolioData.totalValueChange)) * 100).toFixed(2)}%)
                        </span>
                        <span className="text-xs text-muted-foreground">24h</span>
                      </div>
                    </div>
                  
                  <div className="h-64">
                    {chartLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="space-y-4 w-full">
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-48 w-full" />
                          <Skeleton className="h-4 w-1/3" />
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={portfolioData.chartData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="time"
                            tickFormatter={(value) => {
                              const date = new Date(value)
                              if (selectedTimeframe === '24H') {
                                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              }
                              return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
                            }}
                            axisLine={false}
                            tickLine={false}
                            className="text-xs"
                          />
                          <YAxis 
                            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                            axisLine={false}
                            tickLine={false}
                            className="text-xs"
                          />
                          <Tooltip
                            formatter={(value: number) => [`$${formatCurrency(value)}`, 'Portfolio Value']}
                            labelFormatter={(label) => {
                              const date = new Date(label)
                              if (selectedTimeframe === '24H') {
                                return date.toLocaleString()
                              }
                              return date.toLocaleDateString()
                            }}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px'
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No portfolio data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Holdings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Holdings</CardTitle>
                  <CardDescription>Your current cryptocurrency positions</CardDescription>
                </div>
                {isConnected && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowManualEntryModal(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Asset
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : portfolioData && portfolioData.holdings.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px]">Asset</TableHead>
                          <TableHead className="text-right min-w-[120px]">Balance</TableHead>
                          <TableHead className="text-right min-w-[120px]">Market Value</TableHead>
                          <TableHead className="text-right min-w-[100px]">24h Change</TableHead>
                          <TableHead className="text-right min-w-[80px]">24h Chart</TableHead>
                          <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                    <TableBody>
                      {portfolioData.holdings.map((holding) => (
                        <TableRow key={holding.symbol} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <CryptoIcon symbol={holding.symbol} size={32} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{holding.symbol}</span>
                                  {holding.isManual && (
                                    <Badge variant="secondary" className="text-xs h-5 px-1.5">
                                      M
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">{holding.name}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div>
                              <div className="font-medium">
                                {formatTokenAmount(holding.balance, holding.decimals)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {holding.price ? `$${formatCurrency(holding.price)}` : holding.isManual ? 'N/A' : '—'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {holding.marketValue ? `$${formatCurrency(holding.marketValue)}` : holding.isManual ? 'N/A' : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            {holding.priceChange24h !== undefined && holding.priceChange24h !== null ? (
                              <div className={`flex items-center justify-end gap-1 ${
                                holding.priceChange24h >= 0 ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {holding.priceChange24h >= 0 ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                <span className="text-sm font-medium">
                                  {holding.priceChange24h >= 0 ? '+' : ''}{(holding.priceChange24h || 0).toFixed(2)}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              {holding.sparklineData && (
                                <div className="w-16 h-8">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={holding.sparklineData}>
                                      <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke={holding.priceChange24h && holding.priceChange24h >= 0 ? '#10b981' : '#ef4444'}
                                        strokeWidth={1.5}
                                        dot={false}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {holding.isManual && holding.manualEntryId && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleRemoveManualEntry(holding.manualEntryId!)}
                                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                  <Plus className="h-4 w-4 rotate-45" />
                                </Button>
                              )}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedAsset(holding)}
                                  >
                                    <ArrowUpRight className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{holding.name} ({holding.symbol})</DialogTitle>
                                  <DialogDescription>
                                    Detailed information about your {holding.symbol} position
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Current Price</p>
                                      <p className="text-lg font-semibold">
                                        {holding.price ? `$${formatCurrency(holding.price)}` : '—'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">24h Change</p>
                                      <p className={`text-lg font-semibold ${
                                        holding.priceChange24h && holding.priceChange24h >= 0 ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'
                                      }`}>
                                        {holding.priceChange24h !== undefined && holding.priceChange24h !== null ? 
                                          `${holding.priceChange24h >= 0 ? '+' : ''}${(holding.priceChange24h || 0).toFixed(2)}%` : '—'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Your Balance</p>
                                      <p className="text-lg font-semibold">
                                        {formatTokenAmount(holding.balance, holding.decimals)} {holding.symbol}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Market Value</p>
                                      <p className="text-lg font-semibold">
                                        {holding.marketValue ? `$${formatCurrency(holding.marketValue)}` : '—'}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {holding.address !== 'native' && (
                                    <div className="pt-4 border-t">
                                      <p className="text-sm text-muted-foreground mb-2">Contract Address</p>
                                      <div className="flex items-center gap-2">
                                        <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                                          {holding.address}
                                        </code>
                                        <Button variant="outline" size="sm">
                                          <ExternalLink className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                                                          </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">No assets found</h3>
                    <p className="text-sm text-muted-foreground">
                      Add some cryptocurrency to your wallet or manually add assets to start tracking your portfolio.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowManualEntryModal(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Asset Manually
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>



        {/* Manual Portfolio Entry Modal */}
        <ManualPortfolioModal
          isOpen={showManualEntryModal}
          onClose={() => setShowManualEntryModal(false)}
          onSubmit={handleAddManualEntry}
        />
      </div>
    </>
  )
}
