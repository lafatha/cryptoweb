"use client"

import { motion } from "framer-motion"
import { AuthGuard } from "@/components/auth-guard"
import { WalletConnect } from "@/components/wallet-connect"
import { PortfolioCharts } from "@/components/portfolio-charts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Wallet,
  PieChart,
  TrendingUp,
  Shield,
  RefreshCw,
  Settings,
  Download
} from "lucide-react"

export default function PortfolioPage() {
  return (
    <AuthGuard>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
              <p className="text-muted-foreground">
                Manage your cryptocurrency portfolio and track performance across multiple blockchains.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Security Notice */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Secure Portfolio Access</p>
                  <p className="text-xs text-muted-foreground">
                    Your portfolio data is encrypted and only accessible with your authenticated session.
                    Wallet addresses are read-only for balance tracking.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="wallets" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Wallets
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <PortfolioCharts />
            </TabsContent>

            <TabsContent value="wallets" className="space-y-6">
              <WalletConnect />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>
                      Key performance indicators for your portfolio
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                        <p className="text-2xl font-bold">1.84</p>
                        <Badge variant="secondary" className="text-xs">Excellent</Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Max Drawdown</p>
                        <p className="text-2xl font-bold text-red-500">-12.3%</p>
                        <Badge variant="outline" className="text-xs">Moderate</Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Win Rate</p>
                        <p className="text-2xl font-bold text-green-500">68.2%</p>
                        <Badge variant="secondary" className="text-xs">Good</Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Volatility</p>
                        <p className="text-2xl font-bold">24.7%</p>
                        <Badge variant="outline" className="text-xs">High</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Asset Allocation Targets */}
                <Card>
                  <CardHeader>
                    <CardTitle>Allocation Targets</CardTitle>
                    <CardDescription>
                      Recommended vs actual asset allocation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { name: "Bitcoin", current: 45, target: 40, diff: +5 },
                      { name: "Ethereum", current: 25, target: 30, diff: -5 },
                      { name: "Solana", current: 15, target: 15, diff: 0 },
                      { name: "Others", current: 15, target: 15, diff: 0 },
                    ].map((asset) => (
                      <div key={asset.name} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{asset.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {asset.current}% / {asset.target}%
                          </span>
                          <Badge 
                            variant={asset.diff === 0 ? "secondary" : asset.diff > 0 ? "default" : "outline"}
                            className="text-xs"
                          >
                            {asset.diff > 0 ? "+" : ""}{asset.diff}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest portfolio changes and transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          action: "Buy",
                          asset: "SOL",
                          amount: "10.5",
                          value: "$1,078.50",
                          time: "2 hours ago",
                          type: "success"
                        },
                        {
                          action: "Sell",
                          asset: "ADA",
                          amount: "500",
                          value: "$242.50",
                          time: "1 day ago",
                          type: "warning"
                        },
                        {
                          action: "Buy",
                          asset: "ETH",
                          amount: "2.0",
                          value: "$5,161.00",
                          time: "3 days ago",
                          type: "success"
                        },
                      ].map((tx, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={tx.type === "success" ? "default" : "secondary"}
                              className="min-w-[60px]"
                            >
                              {tx.action}
                            </Badge>
                            <div>
                              <p className="font-medium">{tx.amount} {tx.asset}</p>
                              <p className="text-sm text-muted-foreground">{tx.time}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{tx.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AuthGuard>
  )
}
