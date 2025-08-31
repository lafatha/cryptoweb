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

// Robot SVG Icon Component from navbar
const RobotIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg 
    viewBox="0 0 32 32" 
    className={className}
    fill="currentColor"
  >
    {/* Robot Head */}
    <rect x="8" y="8" width="16" height="12" rx="2" className="fill-gray-700 dark:fill-gray-300" />
    
    {/* Robot Eyes */}
    <circle cx="12" cy="12" r="1.5" className="fill-white dark:fill-gray-900" />
    <circle cx="20" cy="12" r="1.5" className="fill-white dark:fill-gray-900" />
    
    {/* Robot Mouth */}
    <rect x="14" y="16" width="4" height="1" rx="0.5" className="fill-white dark:fill-gray-900" />
    
    {/* Robot Antenna */}
    <line x1="16" y1="8" x2="16" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="16" cy="4" r="1" className="fill-gray-700 dark:fill-gray-300" />
    
    {/* Robot Body */}
    <rect x="10" y="20" width="12" height="8" rx="1" className="fill-gray-600 dark:fill-gray-400" />
    
    {/* Robot Arms */}
    <rect x="6" y="22" width="4" height="2" rx="1" className="fill-gray-600 dark:fill-gray-400" />
    <rect x="22" y="22" width="4" height="2" rx="1" className="fill-gray-600 dark:fill-gray-400" />
  </svg>
)

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
          className="h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-black border border-white flex items-center justify-center"
        >
          {/* Larger robot head only, black/white theme */}
          <svg viewBox="0 0 32 20" className="w-16 h-16" fill="none">
            {/* Head */}
            <rect x="4" y="2" width="24" height="16" rx="5" fill="#fff" stroke="#222" strokeWidth="2" />
            {/* Eyes */}
            <circle cx="12" cy="10" r="3" fill="#222" />
            <circle cx="20" cy="10" r="3" fill="#222" />
            {/* Mouth */}
            <rect x="14" y="14" width="4" height="2" rx="1" fill="#222" />
            {/* Antenna */}
            <line x1="16" y1="2" x2="16" y2="-1" stroke="#222" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="-1" r="1.5" fill="#fff" stroke="#222" strokeWidth="1" />
          </svg>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <Card className="shadow-2xl border border-slate-800 bg-slate-950 text-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center space-x-3">
            <RobotIcon className="w-8 h-8 text-gray-200" />
            <CardTitle className="text-lg text-gray-200">AI Assistant</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/chat')}
              className="text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-slate-800"
              title="Open fullscreen chat"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggle}
              className="text-gray-400 hover:text-gray-200 hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'insights' | 'chat')}>
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2 bg-slate-900 border border-slate-800">
                <TabsTrigger value="insights" className="text-gray-400 data-[state=active]:text-gray-200 data-[state=active]:bg-slate-950 data-[state=active]:border data-[state=active]:border-slate-800 hover:bg-white/5 hover:text-gray-200">
                  Insights
                </TabsTrigger>
                <TabsTrigger value="chat" className="text-gray-400 data-[state=active]:text-gray-200 data-[state=active]:bg-slate-950 data-[state=active]:border data-[state=active]:border-slate-800 hover:bg-white/5 hover:text-gray-200">
                  Chat
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="insights" className="p-6 pt-4 space-y-4">
              {/* Error Banner */}
              {analysisError && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <p className="text-sm text-gray-200">{analysisError}</p>
                  </div>
                </div>
              )}

              {/* Refresh Button */}
              <Button 
                onClick={runAnalysis} 
                disabled={isAnalyzing}
                className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500/35 focus:ring-offset-0 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isAnalyzing ? 'Menganalisis...' : 'Refresh Analysis'}
              </Button>

              {/* Insights Display */}
              <ScrollArea className="h-64">
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
                    <p className="text-sm text-gray-400">
                      Klik "Refresh Analysis" untuk mendapatkan insights terbaru
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="chat" className="p-0 space-y-0">
              {/* Chat Messages */}
              <ScrollArea className="px-6 h-64">
                <div className="space-y-4 py-4">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <RobotIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-sm text-gray-400 mb-3">
                        Ask me anything about cryptocurrency
                      </p>
                      <Button
                        onClick={() => router.push('/chat')}
                        className="bg-emerald-500 text-slate-950 hover:bg-emerald-600"
                      >
                        Open Full Chat
                      </Button>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        message.role === 'user' 
                          ? 'bg-emerald-500 text-slate-950 ml-4' 
                          : 'bg-slate-900 text-gray-200 mr-4 border border-slate-800'
                      }`}>
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-2 opacity-70 ${
                          message.role === 'user' ? 'text-slate-700' : 'text-gray-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-slate-900 text-gray-200 rounded-2xl px-4 py-3 text-sm mr-4 border border-slate-800">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-200 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-200 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-200 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
              <div className="p-6 pt-4 border-t border-slate-800">
                <div className="flex items-center space-x-3 bg-slate-950 rounded-xl border border-slate-800 p-3">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isSending}
                    className="flex-1 border-none bg-transparent text-gray-200 placeholder-gray-400 focus:ring-0 focus:outline-none"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isSending}
                    size="sm"
                    className="bg-transparent border border-slate-800 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-xl px-4 py-2 h-auto"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        {/* Disclaimer */}
        <div className="px-6 pb-4 border-t border-slate-800">
          <p className="text-xs text-gray-400 text-center pt-4">
            <AlertTriangle className="h-3 w-3 inline mr-1 text-amber-500" />
            Educational information only, not financial advice
          </p>
        </div>
      </Card>
    </div>
  )
}
