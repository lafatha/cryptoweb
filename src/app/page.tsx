"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MarketTicker } from "@/components/market-ticker"
import HeroSection from "@/components/HeroSection"
import { Footer } from "@/components/footer"
import { BarChart3, Shield, Bot, Wallet } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI-Powered Insights",
    description: "Get intelligent recommendations powered by real-time AI analysis."
  },
  {
    icon: Wallet,
    title: "Multi-Wallet Support",
    description: "Seamlessly connect wallets and exchanges in one dashboard."
  },
  {
    icon: BarChart3,
    title: "Real-Time Tracking",
    description: "Always know your portfolio's value with live data feeds."
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your assets, your data. We never compromise security."
  }
]

const faqs = [
  {
    question: "Do I need to sign up?",
    answer: "Yes, but it's quick and free."
  },
  {
    question: "Do I need to deposit funds?",
    answer: "No, just connect your wallets and exchanges."
  },
  {
    question: "Is this AI powered?",
    answer: "Yes, AI provides insights and recommendations in real time."
  },
  {
    question: "Can I track CEX assets?",
    answer: "Yes, major exchanges are supported."
  }
]

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Market Ticker */}
      <MarketTicker />
      
      {/* Hero Section with Chat */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-black">
        {/* Minimal background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0,0.02)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgb(255,255,255,0.02)_1px,transparent_0)] bg-[size:32px_32px]" />
        
        <div className="container max-w-6xl mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center space-y-6 mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black dark:text-white tracking-tight">
              Everything You Need
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-light">
              Professional crypto tracking made simple
            </p>
          </motion.div>

          {/* Horizontal Feature Blocks */}
          <div className="space-y-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="group"
                >
                  <div className="flex items-start space-x-6 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-black dark:bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-6 w-6 text-white dark:text-black" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-black dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose CryptoFinance Section */}
      <section className="py-24 bg-white dark:bg-black">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center space-y-6 mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black dark:text-white tracking-tight">
              Why CryptoFinance?
            </h2>
          </motion.div>

          <div className="space-y-12">
            {[
              {
                title: "Transparency",
                description: "No hidden fees, no dark patterns. Just clarity."
              },
              {
                title: "Security",
                description: "Enterprise-grade encryption keeps your data safe."
              },
              {
                title: "Simplicity",
                description: "All your crypto in one clean, intelligent interface."
              },
              {
                title: "Future-Proof",
                description: "Built with AI, designed for tomorrow's investors."
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="border-b border-gray-200 dark:border-gray-800 pb-12 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <h3 className="text-3xl md:text-4xl font-black text-black dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-xl text-gray-600 dark:text-gray-400 md:max-w-md font-light">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white dark:bg-black">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center space-y-6 mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={`faq-${index}`} 
                  value={`item-${index}`}
                  className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black rounded-2xl px-6 py-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300"
                >
                  <AccordionTrigger className="text-left text-xl font-bold hover:no-underline text-black dark:text-white transition-colors duration-300">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 dark:text-gray-400 leading-relaxed pt-2 pb-4 text-lg">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

        </div>
      </section>

      {/* Bottom Market Ticker */}
      <section className="border-t">
        <MarketTicker />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}