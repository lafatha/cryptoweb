"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart as PieChartIcon } from "lucide-react"

const portfolioData = [
  { name: "Bitcoin", value: 45, amount: "$12,450", color: "#f7931a" },
  { name: "Ethereum", value: 25, amount: "$6,890", color: "#627eea" },
  { name: "Solana", value: 15, amount: "$4,125", color: "#9945ff" },
  { name: "Cardano", value: 8, amount: "$2,200", color: "#0033ad" },
  { name: "Others", value: 7, amount: "$1,925", color: "#64748b" },
]

const totalValue = portfolioData.reduce((sum, item) => 
  sum + parseFloat(item.amount.replace('$', '').replace(',', '')), 0
)

export function PortfolioChart() {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Portfolio Allocation
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Total Portfolio Value: <span className="font-bold text-foreground">
            ${totalValue.toLocaleString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {portfolioData.map((entry, index) => (
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
          {portfolioData.map((item) => (
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
