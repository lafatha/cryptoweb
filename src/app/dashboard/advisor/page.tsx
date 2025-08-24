"use client"

import { motion } from "framer-motion"
import { AuthGuard } from "@/components/auth-guard"
import { AIChat } from "@/components/ai-chat"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Brain,
  Sparkles,
  TrendingUp,
  Shield,
  Clock,
  Target,
  AlertTriangle,
  Info
} from "lucide-react"

const AI_CAPABILITIES = [
  {
    icon: TrendingUp,
    title: "Market Analysis",
    description: "Real-time market trends and price predictions based on technical and fundamental analysis."
  },
  {
    icon: Target,
    title: "Portfolio Optimization",
    description: "Personalized asset allocation recommendations to maximize returns and minimize risk."
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Advanced risk assessment and mitigation strategies for your cryptocurrency investments."
  },
  {
    icon: Clock,
    title: "Timing Insights",
    description: "Optimal entry and exit points based on market sentiment and technical indicators."
  }
]

export default function AIAdvisorPage() {
  return (
    <AuthGuard>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                AI Financial Advisor
              </h1>
              <p className="text-muted-foreground">
                Get personalized cryptocurrency investment advice powered by advanced AI algorithms.
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              Beta Version
            </Badge>
          </div>

          {/* Beta Notice */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This AI advisor is currently in beta and provides educational insights only. 
              Always conduct your own research and consider consulting with financial professionals 
              before making investment decisions.
            </AlertDescription>
          </Alert>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <AIChat />
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* AI Capabilities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Capabilities</CardTitle>
                <CardDescription>
                  What our AI advisor can help you with
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {AI_CAPABILITIES.map((capability, index) => {
                  const Icon = capability.icon
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{capability.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {capability.description}
                      </p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Portfolio Context */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Portfolio Context</CardTitle>
                <CardDescription>
                  AI advisor is aware of your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Value</span>
                  <span className="font-medium">$27,590</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Assets</span>
                  <span className="font-medium">5 cryptocurrencies</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">P&L (24h)</span>
                  <span className="font-medium text-green-500">+4.69%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Risk Level</span>
                  <Badge variant="outline" className="text-xs">Moderate</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Market Sentiment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Sentiment</CardTitle>
                <CardDescription>
                  Current market conditions analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Overall Sentiment</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Bullish
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fear & Greed Index</span>
                  <span className="font-medium">68 (Greed)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Market Volatility</span>
                  <Badge variant="outline" className="text-xs">Medium</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Trend Direction</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-sm text-green-500">Upward</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card className="border-orange-200 dark:border-orange-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Investment Disclaimer</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Cryptocurrency investments carry significant risk. AI-generated advice 
                      is for educational purposes only and should not be considered as 
                      financial advice. Past performance does not guarantee future results.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  )
}
