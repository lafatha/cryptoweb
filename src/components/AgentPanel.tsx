'use client'

import { useState } from 'react'
import { X, Bot, Loader2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Insight {
  title: string
  body: string
  severity: 'info' | 'warning' | 'danger'
  confidence: number
}

interface AgentResponse {
  insights: Insight[]
  watchlist?: string[]
}

interface AgentPanelProps {
  portfolioData: any[]
  onClose: () => void
}

export default function AgentPanel({ portfolioData, onClose }: AgentPanelProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<AgentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runAgent = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Prepare portfolio data in the expected format
      const holdings = portfolioData.map(coin => ({
        symbol: coin.symbol?.toUpperCase() || 'UNKNOWN',
        amount: coin.amount || 0,
        currentPrice: coin.current_price || coin.price || 0,
        priceChange24h: coin.price_change_percentage_24h || 0,
        value: (coin.amount || 0) * (coin.current_price || coin.price || 0)
      }))

      const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0)

      const requestBody = {
        holdings,
        totalValue,
        market: {
          trending: [], // Will be populated by the API
          avgChange24h: holdings.length > 0 
            ? holdings.reduce((sum, h) => sum + h.priceChange24h, 0) / holdings.length 
            : 0
        },
        news: [] // Will be populated by the API
      }

      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await res.json()
      
      if (data.ok) {
        setResponse({
          insights: data.insights || [],
          watchlist: data.watchlist || []
        })
      } else if (data.fallback) {
        setResponse({
          insights: data.fallback.insights || [],
          watchlist: []
        })
        setError(data.message || 'Menggunakan data fallback karena gangguan layanan')
      } else {
        setError(data.message || 'Koneksi bermasalah. Silakan coba lagi.')
      }
    } catch (err) {
      console.error('Agent panel error:', err)
      setError('Koneksi bermasalah. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Info className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'danger':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300'
      case 'danger':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-blue-600" />
            <CardTitle>AI Portfolio Assistant</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          {!response && !isLoading && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                AI Assistant siap menganalisis portofolio Anda dan memberikan insights berdasarkan data market terkini.
              </p>
              <Button onClick={runAgent} className="w-full">
                <Bot className="h-4 w-4 mr-2" />
                Analisis Portofolio
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <div className="text-center space-y-2">
                <p className="font-medium">Menganalisis portofolio Anda...</p>
                <p className="text-sm text-muted-foreground">
                  Mengambil data market, trending coins, dan berita terkini
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800 dark:text-yellow-300">{error}</p>
              </div>
            </div>
          )}

          {response && (
            <ScrollArea className="flex-1 max-h-96">
              <div className="space-y-4">
                {/* Insights */}
                <div className="space-y-3">
                  {response.insights.map((insight, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between space-x-3">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-2">
                              {getSeverityIcon(insight.severity)}
                              <h4 className="font-medium">{insight.title}</h4>
                              <Badge 
                                variant="outline" 
                                className={getSeverityColor(insight.severity)}
                              >
                                {insight.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {insight.body}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                Confidence: {insight.confidence}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Watchlist */}
                {response.watchlist && response.watchlist.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Watchlist Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {response.watchlist.map((symbol, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {symbol}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Refresh Button */}
                <Button 
                  onClick={runAgent} 
                  variant="outline" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Bot className="h-4 w-4 mr-2" />
                  )}
                  Refresh Analysis
                </Button>
              </div>
            </ScrollArea>
          )}

          {/* Disclaimer */}
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground text-center">
              ⚠️ Informasi ini bersifat edukatif dan bukan nasihat finansial. 
              Selalu lakukan riset sendiri sebelum membuat keputusan investasi.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
