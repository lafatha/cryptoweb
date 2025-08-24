"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTickerData } from "@/hooks/use-crypto-data"
import { formatCurrency, formatPercentage } from "@/lib/api/coingecko"

export function MarketTicker() {
  const { data: currentData, error, isLoading } = useTickerData()

  if (error || isLoading) {
    return (
      <div className="w-full bg-muted/50 border-y overflow-hidden">
        <div className="flex items-center justify-center py-3">
          <span className="text-sm text-muted-foreground">
            {isLoading ? "Loading market data..." : "Market data unavailable"}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-muted/50 border-y overflow-hidden">
      <motion.div
        className="flex items-center space-x-8 py-3 whitespace-nowrap"
        animate={{ x: [0, -100 * currentData.length] }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Duplicate the data to create seamless loop */}
        {[...currentData, ...currentData].map((crypto, index) => (
          <div key={`${crypto.symbol}-${index}`} className="flex items-center space-x-2 min-w-fit">
            <span className="font-semibold text-sm uppercase">{crypto.symbol}</span>
            <span className="financial-number text-sm">
              {formatCurrency(crypto.current_price)}
            </span>
            <span className={cn(
              "text-xs font-medium",
              crypto.price_change_percentage_24h >= 0 ? "positive" : "negative"
            )}>
              {formatPercentage(crypto.price_change_percentage_24h)}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
