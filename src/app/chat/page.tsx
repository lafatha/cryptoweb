"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePortfolio } from '@/contexts/portfolio-context'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Robot SVG Icon Component from navbar (matching panel)
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

export default function ChatPage() {
  const router = useRouter()
  const { portfolioData } = usePortfolio()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setSending] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

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
      const holdings = portfolioData?.holdings || []
      const topHoldings = holdings.length > 0 
        ? holdings.slice(0, 3).map(item => ({
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
        ? `Portfolio worth $${totalValue.toLocaleString()} with average ${avgChange.toFixed(1)}% change in 24h`
        : 'Empty portfolio - can provide general cryptocurrency information'

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
            content: `Sorry, ${data.message || 'an error occurred'}. Please try again.`,
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
        content: 'Sorry, an error occurred. Please try again.',
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

  return (
    <div className="min-h-screen bg-slate-950 text-gray-200 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-200 hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <RobotIcon className="w-8 h-8 text-gray-200" />
            <h1 className="text-lg font-semibold text-gray-200">AI Portfolio Assistant</h1>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1 px-4">
          <div className="max-w-4xl mx-auto py-6 space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-20">
                <RobotIcon className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold mb-4 text-gray-200">Welcome to AI Portfolio Assistant</h2>
                <p className="text-gray-400 text-lg">
                  Ask me anything about cryptocurrency and your portfolio
                </p>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl rounded-2xl px-6 py-4 ${
                  message.role === 'user' 
                    ? 'bg-emerald-500 text-slate-950 ml-8' 
                    : 'bg-slate-900 text-gray-200 mr-8 border border-slate-800'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                  <div className={`text-xs mt-3 ${
                    message.role === 'user' ? 'text-slate-700' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-900 text-gray-200 rounded-2xl px-6 py-4 mr-8 border border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-200 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-200 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-200 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-gray-400 text-sm">AI is typing...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-slate-800 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-4 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3">
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
        </div>
      </div>
    </div>
  )
}
