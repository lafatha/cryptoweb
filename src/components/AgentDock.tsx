'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, RefreshCw, AlertTriangle, Info, AlertCircle, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Insight {
  title: string
  body: string
  severity: 'info' | 'warning' | 'danger'
  confidence: number
}

interface WatchlistItem {
  symbol: string
  reason: string
}

interface AnalysisResult {
  ok: boolean
  code?: string
  message?: string
  insights?: Insight[]
  watchlist?: WatchlistItem[]
  fallback?: {
    insights: Insight[]
  }
}

interface AgentDockProps {
  portfolioData: any[]
  isOpen: boolean
  onToggle: () => void
}

export default function AgentDock({ portfolioData, isOpen, onToggle }: AgentDockProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'insights' | 'chat'>('insights')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setSending] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && activeTab === 'chat' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, activeTab])

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisError(null)
    
    try {
      // Prepare portfolio data for analysis
      const holdings = portfolioData.length > 0 
        ? portfolioData.slice(0, 5).map(item => ({
            symbol: item.symbol,
            amount: parseFloat(item.balance) || 0,
            value: item.marketValue || 0
          }))
        : [] // Empty portfolio case

      const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)

      const response = await fetch('/api/agent/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          holdings,
          totalValue,
          market: {
            trending: [],
            gainers: [],
            losers: []
          },
          news: []
        })
      })

      // Handle HTTP errors
      if (!response.ok) {
        let errorMessage = 'Gagal menganalisis portofolio'
        try {
          const errorData = await response.json()
          if (errorData.code === 'LLM_DOWN') {
            errorMessage = 'AI service sedang down. Coba lagi nanti.'
          } else if (errorData.code === 'LLM_TIMEOUT') {
            errorMessage = 'AI service timeout. Coba lagi.'
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch (e) {
          // Fall back to generic message
        }
        setAnalysisError(errorMessage)
        return
      }

      const data = await response.json()
      setAnalysisResult(data)
      
      if (!data.ok) {
        // Handle specific error codes
        let errorMessage = data.message || 'Gagal menganalisis portofolio'
        if (data.code === 'LLM_DOWN') {
          errorMessage = 'AI service sedang down. Coba lagi nanti.'
        } else if (data.code === 'BAD_JSON') {
          errorMessage = 'Analisis gagal diformat. Coba refresh.'
        } else if (data.code === 'NO_API_KEY') {
          errorMessage = 'AI service belum dikonfigurasi.'
        }
        setAnalysisError(errorMessage)
      }
      
    } catch (error) {
      console.error('Analysis error:', error)
      setAnalysisError('Koneksi bermasalah. Silakan coba lagi.')
      setAnalysisResult({
        ok: false,
        code: 'NETWORK_ERROR',
        message: 'Koneksi bermasalah. Silakan coba lagi.'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isSending) return
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setSending(true)
    setIsTyping(true)

    try {
      // Prepare context from portfolio
      const topHoldings = portfolioData.length > 0 
        ? portfolioData.slice(0, 3).map(item => ({
            symbol: item.symbol,
            value: item.marketValue || 0,
            change24h: item.priceChange24h
          }))
        : []

      const totalValue = topHoldings.reduce((sum, h) => sum + h.value, 0)
      const avgChange = topHoldings.length > 0 
        ? topHoldings.reduce((sum, h) => sum + (h.change24h || 0), 0) / topHoldings.length
        : 0

      const marketBrief = totalValue > 0 
        ? `Portfolio senilai $${totalValue.toLocaleString()} dengan perubahan rata-rata ${avgChange.toFixed(1)}% dalam 24h`
        : 'Portfolio kosong - dapat memberikan informasi umum tentang cryptocurrency'

      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(m => ({ role: m.role, content: m.content })),
          context: {
            topHoldings: topHoldings.length > 0 ? topHoldings : [],
            marketBrief
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      // Check content type
      const contentType = response.headers.get("content-type") || ""
      
      if (contentType.includes("text/event-stream")) {
        // SSE MODE
        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No response stream')
        }

        let assistantMessage = ''
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                setIsTyping(false)
                return
              }

              try {
                const parsed = JSON.parse(data)
                
                if (parsed.error) {
                  throw new Error(parsed.message || 'Chat error')
                }
                
                if (parsed.content) {
                  assistantMessage += parsed.content
                  
                  // Update messages with streaming content
                  setMessages(prev => {
                    const newMessages = [...prev]
                    const lastMessage = newMessages[newMessages.length - 1]
                    
                    if (lastMessage && lastMessage.role === 'assistant') {
                      lastMessage.content = assistantMessage
                    } else {
                      newMessages.push({
                        id: (Date.now() + Math.random()).toString(),
                        role: 'assistant',
                        content: assistantMessage,
                        timestamp: new Date()
                      })
                    }
                    
                    return newMessages
                  })
                }
              } catch (e) {
                // Skip invalid JSON lines
                continue
              }
            }
          }
        }
      } else {
        // JSON FALLBACK MODE
        const data = await response.json()
        
        if (data?.content) {
          // Direct JSON response
          const assistantMessage: ChatMessage = {
            id: (Date.now() + Math.random()).toString(),
            role: 'assistant',
            content: data.content,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, assistantMessage])
        } else if (data?.error) {
          // Error response
          const errorMessage: ChatMessage = {
            id: (Date.now() + Math.random()).toString(),
            role: 'assistant',
            content: `Maaf, ${data.message || 'terjadi kesalahan'}. Silakan coba lagi.`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, errorMessage])
        } else {
          throw new Error('Invalid response format')
        }
      }

    } catch (error) {
      console.error('Chat error:', error)
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + Math.random()).toString(),
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setSending(false)
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'danger':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
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

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          onClick={onToggle}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-black hover:bg-gray-900 border border-white"
        >
          {/* New Bot Logo */}
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <div className="relative">
              {/* Bot Eyes */}
              <div className="flex space-x-1 mb-1">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
              </div>
              {/* Bot Antenna */}
              <div className="w-0.5 h-2 bg-black mx-auto"></div>
              <div className="w-1 h-1 bg-black rounded-full mx-auto -mt-0.5"></div>
            </div>
          </div>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <Card className="shadow-2xl border border-white bg-black text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            {/* New Bot Logo in Header */}
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <div className="relative">
                {/* Bot Eyes */}
                <div className="flex space-x-1 mb-1">
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                </div>
                {/* Bot Antenna */}
                <div className="w-0.5 h-2 bg-black mx-auto"></div>
                <div className="w-1 h-1 bg-black rounded-full mx-auto -mt-0.5"></div>
              </div>
            </div>
            <CardTitle className="text-lg text-white">AI Assistant</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/chat')}
              className="text-white hover:bg-gray-800 border border-white"
              title="Open fullscreen chat"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggle}
              className="text-white hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'insights' | 'chat')}>
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2 bg-gray-900 border border-gray-700">
                <TabsTrigger value="insights" className="text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gray-800">
                  Insights
                </TabsTrigger>
                <TabsTrigger value="chat" className="text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gray-800">
                  Chat
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="insights" className="p-6 pt-4 space-y-4">
              {/* Error Banner */}
              {analysisError && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 dark:bg-yellow-900/20 dark:border-yellow-800">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">{analysisError}</p>
                  </div>
                </div>
              )}

              {/* Refresh Button */}
              <Button 
                onClick={runAnalysis} 
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isAnalyzing ? 'Menganalisis...' : 'Refresh Analysis'}
              </Button>

              {/* Insights Display */}
              <ScrollArea className="h-80">
                {analysisResult ? (
                  <div className="space-y-3">
                    {(analysisResult.insights || analysisResult.fallback?.insights || []).map((insight, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {getSeverityIcon(insight.severity)}
                                <h4 className="font-medium text-sm">{insight.title}</h4>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getSeverityColor(insight.severity)}`}
                              >
                                {insight.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {insight.body}
                            </p>
                            <div className="flex justify-between items-center">
                              <Badge variant="secondary" className="text-xs">
                                Confidence: {Math.round((insight.confidence || 0) * 100)}%
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Watchlist */}
                    {analysisResult.watchlist && analysisResult.watchlist.length > 0 && (
                      <Card>
                        <CardContent className="pt-4">
                          <h4 className="font-medium text-sm mb-2">Watchlist</h4>
                          <div className="space-y-2">
                            {analysisResult.watchlist.map((item, index) => (
                              <div key={index} className="flex items-center justify-between text-xs">
                                <Badge variant="outline">{item.symbol}</Badge>
                                <span className="text-muted-foreground">{item.reason}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      Klik "Refresh Analysis" untuk mendapatkan insights terbaru
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="chat" className="p-0 space-y-0">
              {/* Chat Messages */}
              <ScrollArea className="px-6 h-80">
                <div className="space-y-4 py-4">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
                        <div className="relative">
                          {/* Bot Eyes */}
                          <div className="flex space-x-1 mb-1">
                            <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                          </div>
                          {/* Bot Antenna */}
                          <div className="w-0.5 h-2 bg-black mx-auto"></div>
                          <div className="w-1 h-1 bg-black rounded-full mx-auto -mt-0.5"></div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        Ask me anything about cryptocurrency
                      </p>
                      <Button
                        onClick={() => router.push('/chat')}
                        className="bg-white text-black hover:bg-gray-200"
                      >
                        Open Full Chat
                      </Button>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        message.role === 'user' 
                          ? 'bg-white text-black ml-4' 
                          : 'bg-gray-900 text-white mr-4 border border-gray-700'
                      }`}>
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-2 opacity-70 ${
                          message.role === 'user' ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-900 text-white rounded-2xl px-4 py-3 text-sm mr-4 border border-gray-700">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-gray-400 text-xs">AI is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="p-6 pt-4 border-t border-gray-800">
                <div className="flex items-center space-x-3 bg-black rounded-xl border border-white p-3">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isSending}
                    className="flex-1 border-none bg-transparent text-white placeholder-gray-400 focus:ring-0 focus:outline-none"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isSending}
                    size="sm"
                    className="bg-transparent border border-white text-white hover:bg-gray-800 rounded-xl px-4 py-2 h-auto"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        {/* Disclaimer */}
        <div className="px-6 pb-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center pt-4">
            ⚠️ Educational information only, not financial advice
          </p>
        </div>
      </Card>
    </div>
  )
}
