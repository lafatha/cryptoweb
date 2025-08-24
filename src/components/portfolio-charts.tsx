"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  BarChart3,
  Activity,
  DollarSign
} from "lucide-react"

// Enhanced portfolio data with historical performance
const portfolioData = [
  { name: "Bitcoin", value: 45, amount: 12450, color: "#f7931a", allocation: 45 },
  { name: "Ethereum", value: 25, amount: 6890, color: "#627eea", allocation: 25 },
  { name: "Solana", value: 15, amount: 4125, color: "#9945ff", allocation: 15 },
  { name: "Cardano", value: 8, amount: 2200, color: "#0033ad", allocation: 8 },
  { name: "Others", value: 7, amount: 1925, color: "#64748b", allocation: 7 },
]

// Historical performance data (mock - can be replaced with real data)
const performanceData = [
  { date: "Jan 1", value: 20000, pnl: 0, volume: 1200 },
  { date: "Jan 7", value: 22500, pnl: 2500, volume: 1800 },
  { date: "Jan 14", value: 21800, pnl: 1800, volume: 2100 },
  { date: "Jan 21", value: 24200, pnl: 4200, volume: 1600 },
  { date: "Jan 28", value: 26100, pnl: 6100, volume: 2400 },
  { date: "Feb 4", value: 25400, pnl: 5400, volume: 1900 },
  { date: "Feb 11", value: 27590, pnl: 7590, volume: 2200 },
]

// Candlestick data for crypto price analysis
const candlestickData = [
  { date: "Jan 1", open: 42000, high: 43500, low: 41800, close: 43200, volume: 2400 },
  { date: "Jan 2", open: 43200, high: 44100, low: 42900, close: 43800, volume: 1800 },
  { date: "Jan 3", open: 43800, high: 44500, low: 43100, close: 43400, volume: 2100 },
  { date: "Jan 4", open: 43400, high: 44200, low: 42800, close: 44000, volume: 1900 },
  { date: "Jan 5", open: 44000, high: 45200, low: 43700, close: 44800, volume: 2600 },
  { date: "Jan 6", open: 44800, high: 45100, low: 44200, close: 44500, volume: 2000 },
  { date: "Jan 7", open: 44500, high: 45800, low: 44100, close: 45400, volume: 2300 },
]

const totalValue = portfolioData.reduce((sum, item) => sum + item.amount, 0)
const totalPnL = performanceData[performanceData.length - 1].pnl
const pnlPercentage = ((totalPnL / (totalValue - totalPnL)) * 100).toFixed(2)

export function PortfolioCharts() {
  const [activeChart, setActiveChart] = useState("overview")

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const CandlestickTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="space-y-1 text-sm">
            <p>Open: <span className="font-mono">${data.open.toLocaleString()}</span></p>
            <p>High: <span className="font-mono text-green-500">${data.high.toLocaleString()}</span></p>
            <p>Low: <span className="font-mono text-red-500">${data.low.toLocaleString()}</span></p>
            <p>Close: <span className="font-mono">${data.close.toLocaleString()}</span></p>
            <p>Volume: <span className="font-mono">{data.volume}</span></p>
          </div>
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">Value: ${data.amount.toLocaleString()}</p>
          <p className="text-sm">Allocation: {data.value}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
                </p>
              </div>
              {totalPnL >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">P&L %</p>
                <p className={`text-2xl font-bold ${parseFloat(pnlPercentage) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {parseFloat(pnlPercentage) >= 0 ? '+' : ''}{pnlPercentage}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assets</p>
                <p className="text-2xl font-bold">{portfolioData.length}</p>
              </div>
              <PieChartIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeChart} onValueChange={setActiveChart}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="allocation">Allocation</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="volume" fill="#8884d8" opacity={0.3} name="Volume" />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#2563eb" 
                      strokeWidth={3}
                      name="Portfolio Value"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pnl" 
                      stroke="#16a34a" 
                      strokeWidth={2}
                      name="P&L"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="allocation" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Asset Breakdown</h3>
                  {portfolioData.map((asset) => (
                    <div key={asset.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: asset.color }}
                        />
                        <span className="font-medium">{asset.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${asset.amount.toLocaleString()}</div>
                        <Badge variant="secondary">{asset.value}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="mt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="pnl" 
                      stroke="#16a34a" 
                      strokeWidth={3}
                      name="Profit & Loss"
                    />
                    <Bar 
                      dataKey="volume" 
                      fill="#8884d8" 
                      opacity={0.6}
                      name="Trading Volume"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Bitcoin Price Analysis</h3>
                  <Badge variant="outline">BTC/USD</Badge>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={candlestickData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['dataMin - 1000', 'dataMax + 1000']} />
                      <Tooltip content={<CandlestickTooltip />} />
                      <Legend />
                      <Bar dataKey="volume" fill="#8884d8" opacity={0.3} name="Volume" />
                      <Line 
                        type="monotone" 
                        dataKey="high" 
                        stroke="#16a34a" 
                        strokeWidth={1}
                        dot={false}
                        name="High"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="low" 
                        stroke="#dc2626" 
                        strokeWidth={1}
                        dot={false}
                        name="Low"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="close" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        name="Close"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
