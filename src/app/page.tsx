"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketTicker } from "@/components/market-ticker"
import { ArrowRight, BarChart3, TrendingUp, Shield, Plus, HelpCircle, Bot, Wallet } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI-Powered Insights",
    description: "Advanced AI analysis combined with verified data sources like CoinGecko for intelligent portfolio recommendations."
  },
  {
    icon: Wallet,
    title: "Multi-Wallet Support",
    description: "Connect MetaMask and other wallets or manually track assets across exchanges with live PnL calculations."
  },
  {
    icon: BarChart3,
    title: "Real-Time Tracking",
    description: "Professional-grade portfolio analytics with live price feeds and comprehensive performance metrics."
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "No sign-ups required. Connect directly with your wallet or track manually - your data stays yours."
  },
  {
    icon: TrendingUp,
    title: "Live Market Data",
    description: "Real-time price feeds, 24h charts, and market insights powered by CoinGecko API."
  },
  {
    icon: Plus,
    title: "Manual Entries",
    description: "Track CEX holdings, DeFi positions, and any crypto asset with custom buy prices and notes."
  }
]

const faqs = [
  {
    question: "Do I need to sign up?",
    answer: "No, you can connect directly with MetaMask or other wallets. No account creation required."
  },
  {
    question: "Do I need to deposit funds?",
    answer: "No deposits needed. This is a tracker only, not an exchange. We never hold your funds."
  },
  {
    question: "Is this AI powered?",
    answer: "Yes. Powered by our in-house AI combined with verified data sources like CoinGecko for intelligent insights."
  },
  {
    question: "Can I track CEX assets?",
    answer: "Yes. You can manually add assets, including buy price, and the app will track live PnL and performance."
  }
]

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Market Ticker */}
      <MarketTicker />
      
      {/* Hero Section */}
      <section className="container max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              AI-Powered
              <span className="block text-primary">Crypto Portfolio Tracker</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto">
              Track all your holdings across wallets, exchanges, and manual entries with live data and AI insights.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/portfolio">
                Start Tracking
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Professional Portfolio Intelligence
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Advanced crypto tracking with AI-powered insights, multi-wallet support, and manual entry capabilities
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

      {/* FAQ Section */}
      <section className="bg-muted/30 py-20">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about our portfolio tracker
            </p>
          </motion.div>
          
          <div className="grid gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <HelpCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-lg text-left">{faq.question}</CardTitle>
                        <CardDescription className="text-base leading-relaxed text-left">
                          {faq.answer}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA at bottom of FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center mt-16 space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Ready to track your portfolio?</h3>
              <p className="text-lg text-muted-foreground">
                Start monitoring your crypto holdings with AI-powered insights
              </p>
            </div>
            <div className="flex justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/portfolio">
                  Start Tracking
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom Market Ticker */}
      <section className="border-t">
        <MarketTicker />
      </section>
    </div>
  )
}