import { Suspense } from 'react'
import { getMarketTickers } from '@/lib/coingecko'
import { MarketTable } from '@/components/market-table'
import { MarketTicker } from '@/components/market-ticker'

async function MarketsData() {
  try {
    const marketData = await getMarketTickers()
    return <MarketTable data={marketData} />
  } catch (error) {
    console.error('Failed to fetch market data:', error)
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load market data</p>
        <p className="text-sm text-muted-foreground mt-2">Please try again later</p>
      </div>
    )
  }
}

function MarketTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-muted animate-pulse rounded" />
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
      ))}
    </div>
  )
}

export default function MarketsPage() {
  return (
    <div className="space-y-6">
      {/* Market Ticker */}
      <MarketTicker />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Markets</h1>
          <p className="text-xl text-muted-foreground">
            Real-time cryptocurrency market data with professional-grade analytics.
          </p>
        </div>

        {/* Market Data */}
        <Suspense fallback={<MarketTableSkeleton />}>
          <MarketsData />
        </Suspense>
      </div>
    </div>
  )
}
