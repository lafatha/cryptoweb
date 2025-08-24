"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketTicker } from "@/components/market-ticker"
import { ArrowRight, BarChart3, PieChart, TrendingUp, Shield, Clock, Zap } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Professional-grade charts and technical analysis tools for informed trading decisions."
  },
  {
    icon: PieChart,
    title: "Portfolio Management",
    description: "Track your investments with comprehensive portfolio analytics and performance metrics."
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    description: "Stay ahead with real-time market data, news, and institutional-grade research."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level security protocols to protect your assets and personal information."
  },
  {
    icon: Clock,
    title: "24/7 Trading",
    description: "Access global cryptocurrency markets around the clock with our robust platform."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Ultra-low latency execution with institutional-grade infrastructure."
  }
]

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Market Ticker */}
      <MarketTicker />
      
      {/* Hero Section */}
      <section className="container px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Professional
              <span className="block text-primary">Crypto Trading</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl">
              Advanced cryptocurrency trading platform with institutional-grade tools, 
              real-time analytics, and comprehensive portfolio management.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/dashboard">
                Start Trading
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8" asChild>
              <Link href="/markets">View Markets</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Partner Strip */}
      <section className="border-y bg-muted/30 py-8">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              Trusted by industry leaders
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
              <div className="text-2xl font-bold">Google</div>
              <div className="text-2xl font-bold">TradingView</div>
              <div className="text-2xl font-bold">AWS</div>
              <div className="text-2xl font-bold">CoinGecko</div>
              <div className="text-2xl font-bold">Chainlink</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Highlights - Data First */}
      <section className="container px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            $2.8T+ Volume Traded
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional-grade infrastructure powering the next generation of cryptocurrency trading
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Trading Preview & CTA */}
      <section className="bg-muted/50 py-20">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - CTA */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Start Trading Now
                </h2>
                <p className="text-xl text-muted-foreground">
                  Join 250,000+ traders using our institutional-grade platform
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button size="lg" className="px-8">
                    Get Started
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  No credit card required. Start with demo account.
                </p>
              </div>
            </motion.div>

            {/* Right side - Trading Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="p-6 bg-background/50 backdrop-blur">
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Live Trading</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm text-muted-foreground">Real-time</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                          <span className="text-xs font-bold">₿</span>
                        </div>
                        <div>
                          <div className="font-medium">BTC/USD</div>
                          <div className="text-sm text-muted-foreground">Bitcoin</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold">$43,250.00</div>
                        <div className="text-sm text-green-500">+2.45%</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-xs font-bold">Ξ</span>
                        </div>
                        <div>
                          <div className="font-medium">ETH/USD</div>
                          <div className="text-sm text-muted-foreground">Ethereum</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold">$2,580.50</div>
                        <div className="text-sm text-red-500">-1.12%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-500">98.7%</div>
                        <div className="text-sm text-muted-foreground">Uptime</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">0.05%</div>
                        <div className="text-sm text-muted-foreground">Trading Fee</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom Market Ticker */}
      <section className="border-t">
        <MarketTicker />
      </section>
    </div>
  )
}