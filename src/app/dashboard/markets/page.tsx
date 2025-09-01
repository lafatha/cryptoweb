"use client"

import { motion } from "framer-motion"
import { CryptoTable } from "@/components/crypto-table"

export default function DashboardMarketsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Cryptocurrency Markets</h1>
        <p className="text-muted-foreground">
          Live cryptocurrency prices, market cap, and 24h price changes
        </p>
      </div>

      {/* Market Data */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <CryptoTable />
      </motion.div>
    </div>
  )
}
