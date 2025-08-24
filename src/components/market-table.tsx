'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatLargeNumber, formatPercentage, MarketTicker } from '@/lib/coingecko'
import { TrendingUp, TrendingDown, Search, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface MarketTableProps {
  data: MarketTicker[]
}

type SortField = keyof MarketTicker
type SortDirection = 'asc' | 'desc'

export function MarketTable({ data }: MarketTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('market_cap_rank')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]
    const multiplier = sortDirection === 'asc' ? 1 : -1

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * multiplier
    }
    return String(aVal).localeCompare(String(bVal)) * multiplier
  })

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-primary transition-colors"
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cryptocurrency Markets
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-16">
                  <SortButton field="market_cap_rank">#</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="name">Name</SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="current_price">Price</SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="price_change_percentage_24h">24h %</SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="price_change_percentage_7d_in_currency">7d %</SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="total_volume">Volume</SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="market_cap">Market Cap</SortButton>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((crypto, index) => (
                <motion.tr
                  key={crypto.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    // Navigate to individual asset page
                    window.location.href = `/markets/${crypto.id}`
                  }}
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
                        <div className="text-sm text-muted-foreground uppercase">
                          {crypto.symbol}
                        </div>
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
                        'financial-number',
                        crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'
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
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        'financial-number text-sm',
                        crypto.price_change_percentage_7d_in_currency >= 0
                          ? 'positive'
                          : 'negative'
                      )}
                    >
                      {formatPercentage(crypto.price_change_percentage_7d_in_currency)}
                    </span>
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

        {sortedData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No cryptocurrencies found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search term
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
