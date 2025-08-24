"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CryptoTable } from "@/components/crypto-table"
import { PortfolioChart } from "@/components/portfolio-chart"
import { NewsFeed } from "@/components/news-feed"
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react"

const stats = [
  {
    title: "Portfolio Value",
    value: "$27,590",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: DollarSign,
  },
  {
    title: "24h P&L",
    value: "+$1,234",
    change: "+4.69%",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
  {
    title: "Total Assets",
    value: "8",
    change: "+2 this month",
    changeType: "positive" as const,
    icon: BarChart3,
  },
  {
    title: "Best Performer",
    value: "SOL",
    change: "+8.4%",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
]

export default function DashboardPage() {
  return (
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
                      <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                    )}
                    <span className={stat.changeType === "positive" ? "text-green-500" : "text-red-500"}>
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
        <NewsFeed layout="list" limit={4} />
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
              <button className="p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left">
                <div className="font-medium">Buy Crypto</div>
                <div className="text-sm text-muted-foreground">Purchase cryptocurrency</div>
              </button>
              <button className="p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left">
                <div className="font-medium">Sell Crypto</div>
                <div className="text-sm text-muted-foreground">Convert to fiat</div>
              </button>
              <button className="p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left">
                <div className="font-medium">Set Alert</div>
                <div className="text-sm text-muted-foreground">Price notifications</div>
              </button>
              <button className="p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left">
                <div className="font-medium">View Reports</div>
                <div className="text-sm text-muted-foreground">Detailed analytics</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
