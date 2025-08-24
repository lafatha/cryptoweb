"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCryptoMarkets } from "@/hooks/use-crypto-data"
import { formatCurrency, formatLargeNumber, formatPercentage } from "@/lib/api/coingecko"
import Image from "next/image"

interface CryptoTableProps {
  limit?: number
}

export function CryptoTable({ limit }: CryptoTableProps) {
  const { data: cryptoData, error, isLoading, refetch } = useCryptoMarkets(1, limit || 100)
  const [sortField, setSortField] = useState<string>("market_cap_rank")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedData = [...cryptoData].sort((a, b) => {
    const aVal = (a as any)[sortField]
    const bVal = (b as any)[sortField]
    const multiplier = sortDirection === "asc" ? 1 : -1
    
    if (typeof aVal === "number" && typeof bVal === "number") {
      return (aVal - bVal) * multiplier
    }
    return String(aVal).localeCompare(String(bVal)) * multiplier
  })

  const displayData = limit ? sortedData.slice(0, limit) : sortedData

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cryptocurrency Markets
            </span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Failed to load market data</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cryptocurrency Markets
          </span>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && displayData.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading market data...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="w-16 cursor-pointer hover:bg-muted/50" 
                    onClick={() => handleSort("market_cap_rank")}
                  >
                    #
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("name")}
                  >
                    Name
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("current_price")}
                  >
                    Price
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("price_change_percentage_24h")}
                  >
                    24h %
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("total_volume")}
                  >
                    Volume
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("market_cap")}
                  >
                    Market Cap
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((crypto, index) => (
                  <motion.tr
                    key={crypto.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium text-muted-foreground">
                      {crypto.market_cap_rank}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={crypto.image}
                            alt={crypto.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{crypto.name}</div>
                          <div className="text-sm text-muted-foreground uppercase">{crypto.symbol}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right financial-number">
                      {formatCurrency(crypto.current_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "financial-number",
                          crypto.price_change_percentage_24h >= 0 ? "positive" : "negative"
                        )}
                      >
                        <span className="flex items-center gap-1">
                          {crypto.price_change_percentage_24h >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatPercentage(crypto.price_change_percentage_24h)}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right financial-number text-muted-foreground">
                      ${formatLargeNumber(crypto.total_volume)}
                    </TableCell>
                    <TableCell className="text-right financial-number">
                      ${formatLargeNumber(crypto.market_cap)}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
