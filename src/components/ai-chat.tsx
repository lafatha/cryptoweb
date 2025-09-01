"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  TrendingUp, 
  PieChart,
  AlertTriangle,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
}

const INITIAL_SUGGESTIONS = [
  "What's the best crypto allocation for my portfolio?",
  "Should I buy Bitcoin or Ethereum right now?",
  "How can I reduce portfolio risk?",
  "What are the latest market trends?",
  "Analyze my portfolio performance",
  "What's driving Solana's price movement?"
]

const MOCK_RESPONSES = {
  portfolio: {
    content: "Based on your current portfolio allocation, I recommend rebalancing to reduce concentration risk. Consider reducing Bitcoin exposure to 35-40% and increasing Ethereum to 25-30%. Your Solana allocation looks optimal at 15%.",
    suggestions: [
      "Show me specific rebalancing steps",
      "What are the tax implications?",
      "When is the best time to rebalance?"
    ]
  },
  bitcoin: {
    content: "Bitcoin is currently showing strong institutional support with recent ETF inflows. However, it's trading near resistance levels. Consider dollar-cost averaging instead of a lump sum purchase. Target entry points around $42,000-$43,000.",
    suggestions: [
      "Set up DCA strategy for Bitcoin",
      "Compare Bitcoin vs Ethereum potential",
      "What are the key support levels?"
    ]
  },
  risk: {
    content: "To reduce portfolio risk, consider: 1) Diversifying across more assets (add some stablecoins), 2) Setting stop-loss orders at -15%, 3) Rebalancing quarterly, and 4) Keeping 10-20% in cash for opportunities.",
    suggestions: [
      "Help me set up stop-loss orders",
      "Recommend low-risk crypto assets",
      "Create a rebalancing schedule"
    ]
  },
  trends: {
    content: "Current market trends show: 1) Institutional adoption accelerating, 2) Layer 2 solutions gaining traction, 3) DeFi yields normalizing, 4) Regulatory clarity improving. Focus on infrastructure plays and established protocols.",
    suggestions: [
      "Which Layer 2 tokens should I consider?",
      "How to play the institutional adoption trend?",
      "Best DeFi protocols for 2024?"
    ]
  },
  default: {
    content: "I'm here to help with your crypto investment decisions! I can analyze your portfolio, suggest optimal allocations, identify market opportunities, and help you manage risk. What specific area would you like to explore?",
    suggestions: [
      "Analyze my portfolio performance",
      "Suggest portfolio improvements",
      "Explain current market conditions"
    ]
  }
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "Hello! I'm your AI Financial Advisor. I can help you optimize your crypto portfolio, analyze market trends, and make informed investment decisions. What would you like to discuss today?",
      timestamp: new Date(),
      suggestions: INITIAL_SUGGESTIONS.slice(0, 3)
    }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const getAIResponse = (userMessage: string): { content: string; suggestions?: string[] } => {
    const message = userMessage.toLowerCase()
    
    if (message.includes("portfolio") || message.includes("allocation")) {
      return MOCK_RESPONSES.portfolio
    } else if (message.includes("bitcoin") || message.includes("btc")) {
      return MOCK_RESPONSES.bitcoin
    } else if (message.includes("risk") || message.includes("safe")) {
      return MOCK_RESPONSES.risk
    } else if (message.includes("trend") || message.includes("market")) {
      return MOCK_RESPONSES.trends
    } else {
      return MOCK_RESPONSES.default
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      // Call the real API
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: content.trim() }
          ],
          context: {
            topHoldings: [], // Could be populated from portfolio data
            marketBrief: "Pasar crypto sedang dinamis dengan volatilitas tinggi"
          }
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      let assistantContent = ""
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "",
        timestamp: new Date()
      }

      // Add the message immediately so we can update it
      setMessages(prev => [...prev, assistantMessage])

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
              if (parsed.content) {
                assistantContent += parsed.content
                // Update the message content
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, content: assistantContent }
                    : msg
                ))
              } else if (parsed.error) {
                // Handle error from server
                assistantContent += `\n\n⚠️ ${parsed.error}`
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, content: assistantContent }
                    : msg
                ))
                setIsTyping(false)
                return
              }
            } catch (e) {
              // Skip invalid JSON
              continue
            }
          }
        }
      }

    } catch (error) {
      console.error('Chat error:', error)
      
      // Check if it's a connection error or timeout
      const isConnectionError = error instanceof TypeError && 
        (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch'))
      const isTimeoutError = error instanceof Error && error.name === 'AbortError'
      
      // Fallback to mock response
      const mockResponse = getAIResponse(content)
      let errorMessage = 'An error occurred while processing your request.'
      
      if (isTimeoutError) {
        errorMessage = 'Request timed out. The AI service is taking too long to respond.'
      } else if (isConnectionError) {
        errorMessage = 'Connection interrupted. Please check your internet connection and try again.'
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `🤖 ${errorMessage}\n\n${mockResponse.content}`,
        timestamp: new Date(),
        suggestions: mockResponse.suggestions
      }

      setMessages(prev => {
        // Remove the empty message if it exists and add the fallback
        const filtered = prev.filter(msg => msg.content !== "")
        return [...filtered, assistantMessage]
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Chat Header */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            AI Financial Advisor
            <Badge variant="secondary" className="ml-auto">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              Online
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-4">
          <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={cn(
                      "flex gap-3",
                      message.type === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.type === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "max-w-[80%] space-y-2",
                      message.type === "user" ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "rounded-lg px-4 py-2",
                        message.type === "user" 
                          ? "bg-primary text-primary-foreground ml-4" 
                          : "bg-muted"
                      )}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                      </div>

                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="space-y-2 mt-3">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Lightbulb className="h-3 w-3" />
                            Suggested follow-ups:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs h-7"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {message.type === "user" && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        {/* Chat Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your portfolio, market trends, or investment strategies..."
              disabled={isTyping}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-muted-foreground">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {INITIAL_SUGGESTIONS.slice(0, 3).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
