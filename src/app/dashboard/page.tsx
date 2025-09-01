"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CryptoTable } from "@/components/crypto-table"
import { PortfolioChart } from "@/components/portfolio-chart"
import { NewsFeed } from "@/components/news-feed"
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Plus, Wallet } from "lucide-react"
import { WalletConnectModal } from "@/components/WalletConnectModal"
import { usePortfolio } from "@/contexts/portfolio-context"
import { 
  getManualPortfolioEntries, 
  addManualPortfolioEntry, 
  enrichManualEntriesWithPricing,
  convertManualEntriesToTokenBalance,
  getTokenIdsFromManualEntries,
  removeManualPortfolioEntry,
  type ManualPortfolioEntry
} from "@/lib/manual-portfolio"
import { 
  getWalletPortfolio,
  addAssetToWalletPortfolio,
  removeAssetFromWalletPortfolio,
  type WalletPortfolio
} from "@/lib/wallet-portfolio"
import { formatCurrency } from "@/lib/portfolio-utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { isConnected, address } = useAccount()
  const { portfolioData } = usePortfolio()
  const [manualEntries, setManualEntries] = useState<ManualPortfolioEntry[]>([])
  const [walletPortfolio, setWalletPortfolio] = useState<WalletPortfolio[]>([])
  const [showWalletModal, setShowWalletModal] = useState(false)

  // Load portfolio data
  useEffect(() => {
    setManualEntries(getManualPortfolioEntries())
    if (isConnected && address) {
      getWalletPortfolio(address).then(setWalletPortfolio)
    }
  }, [isConnected, address])

  // Calculate portfolio statistics
  const totalValue = portfolioData?.totalValue || 0
  const totalPnL24h = portfolioData?.totalPnL24h || 0
  const totalAssets = portfolioData?.holdings?.length || 0
  const bestPerformer = portfolioData?.holdings?.reduce((best, current) => {
    if (!best || (current.pnl24hPercent || 0) > (best.pnl24hPercent || 0)) {
      return current
    }
    return best
  }, portfolioData?.holdings?.[0])

  const stats = [
    {
      title: "Portfolio Value",
      value: formatCurrency(totalValue),
      change: portfolioData?.totalPnLPercent ? `${portfolioData.totalPnLPercent >= 0 ? '+' : ''}${portfolioData.totalPnLPercent.toFixed(2)}%` : "0%",
      changeType: (portfolioData?.totalPnLPercent || 0) >= 0 ? "positive" as const : "negative" as const,
      icon: DollarSign,
    },
    {
      title: "24h P&L",
      value: `${totalPnL24h >= 0 ? '+' : ''}${formatCurrency(Math.abs(totalPnL24h))}`,
      change: portfolioData?.totalPnL24hPercent ? `${portfolioData.totalPnL24hPercent >= 0 ? '+' : ''}${portfolioData.totalPnL24hPercent.toFixed(2)}%` : "0%",
      changeType: totalPnL24h >= 0 ? "positive" as const : "negative" as const,
      icon: totalPnL24h >= 0 ? TrendingUp : TrendingDown,
    },
    {
      title: "Total Assets",
      value: totalAssets.toString(),
      change: totalAssets > 0 ? `${totalAssets} ${totalAssets === 1 ? 'asset' : 'assets'}` : "No assets",
      changeType: "neutral" as const,
      icon: BarChart3,
    },
    {
      title: "Best Performer",
      value: bestPerformer?.symbol || "N/A",
      change: bestPerformer?.pnl24hPercent ? `+${bestPerformer.pnl24hPercent.toFixed(1)}%` : "0%",
      changeType: (bestPerformer?.pnl24hPercent || 0) >= 0 ? "positive" as const : "negative" as const,
      icon: TrendingUp,
    },
  ]

  // Wallet not connected component
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
            Connect your wallet to view your portfolio dashboard, track your assets, and get personalized insights.
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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your cryptocurrency portfolio and market performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {stat.changeType === "positive" ? (
                      <TrendingUp className="mr-1 h-3 w-3 text-gray-500 dark:text-gray-400" />
                    ) : stat.changeType === "negative" ? (
                      <TrendingDown className="mr-1 h-3 w-3 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <BarChart3 className="mr-1 h-3 w-3 text-gray-500 dark:text-gray-400" />
                    )}
                    <span className={
                      stat.changeType === "positive" 
                        ? "text-gray-700 dark:text-gray-300" 
                        : stat.changeType === "negative"
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-gray-600 dark:text-gray-400"
                    }>
                      {stat.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-1"
        >
          <PortfolioChart />
        </motion.div>

        {/* Market Data */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="lg:col-span-2"
        >
          <CryptoTable limit={8} />
        </motion.div>
      </div>

      {/* News Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <NewsFeed />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/dashboard/portfolio" className="p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left block">
                <div className="font-medium flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Manage Portfolio
                </div>
                <div className="text-sm text-muted-foreground">Add or remove assets</div>
              </Link>
              <Link href="/dashboard/chat" className="p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left block">
                <div className="font-medium">AI Advisor</div>
                <div className="text-sm text-muted-foreground">Get investment insights</div>
              </Link>
              <Link href="/dashboard/markets" className="p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left block">
                <div className="font-medium">Market Data</div>
                <div className="text-sm text-muted-foreground">View market trends</div>
              </Link>
              <Link href="/dashboard/news" className="p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left block">
                <div className="font-medium">Latest News</div>
                <div className="text-sm text-muted-foreground">Crypto market updates</div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </>
  )
}
