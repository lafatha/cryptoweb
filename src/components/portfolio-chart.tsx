"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart as PieChartIcon } from "lucide-react"
import { usePortfolio } from "@/contexts/portfolio-context"
import { formatCurrency } from "@/lib/portfolio-utils"

// Grayscale color palette for charts
const CHART_COLORS = [
  "#000000", // Black
  "#404040", // Dark gray
  "#606060", // Medium dark gray  
  "#808080", // Medium gray
  "#A0A0A0", // Light gray
  "#C0C0C0", // Very light gray
]

export function PortfolioChart() {
  const { portfolioData } = usePortfolio()

  // Process portfolio data to get top 5 holdings + others
  const processPortfolioData = () => {
    if (!portfolioData?.holdings || portfolioData.holdings.length === 0) {
      return []
    }

    // Sort holdings by market value (USD) descending
    const sortedHoldings = [...portfolioData.holdings]
      .filter(holding => holding.marketValue && holding.marketValue > 0)
      .sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0))

    const totalValue = portfolioData.totalValue || 0
    
    if (totalValue === 0) {
      return []
    }

    // Get top 5 holdings
    const top5Holdings = sortedHoldings.slice(0, 5)
    const remainingHoldings = sortedHoldings.slice(5)

    // Calculate percentages for top 5
    const processedData = top5Holdings.map((holding, index) => ({
      name: holding.symbol || 'Unknown',
      value: Math.round(((holding.marketValue || 0) / totalValue) * 100),
      amount: `$${formatCurrency(holding.marketValue || 0)}`,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }))

    // Add "Others" category if there are remaining holdings
    if (remainingHoldings.length > 0) {
      const othersValue = remainingHoldings.reduce((sum, holding) => sum + (holding.marketValue || 0), 0)
      const othersPercentage = Math.round((othersValue / totalValue) * 100)
      
      if (othersPercentage > 0) {
        processedData.push({
          name: "Others",
          value: othersPercentage,
          amount: `$${formatCurrency(othersValue)}`,
          color: CHART_COLORS[5 % CHART_COLORS.length]
        })
      }
    }

    return processedData
  }

  const chartData = processPortfolioData()
  const totalValue = portfolioData?.totalValue || 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value}% ({data.amount})
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.value}</span>
            <span className="font-medium">{entry.payload.value}%</span>
          </div>
        ))}
      </div>
    )
  }

  // Show loading or empty state
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Portfolio Allocation
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Total Portfolio Value: <span className="font-bold text-foreground">
              $0
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No portfolio data available</p>
              <p className="text-sm">Connect your wallet or add assets to see allocation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Portfolio Allocation
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Total Portfolio Value: <span className="font-bold text-foreground">
            ${formatCurrency(totalValue)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Portfolio Summary */}
        <div className="mt-6 space-y-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{item.amount}</div>
                <div className="text-sm text-muted-foreground">{item.value}%</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
