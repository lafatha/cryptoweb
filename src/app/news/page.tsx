"use client"

import { motion } from "framer-motion"
import { NewsFeed } from "@/components/news-feed"

export default function NewsPage() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-8">
      {/* Header */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold tracking-tight">News & Insights</h1>
        <p className="text-xl text-muted-foreground">
          Stay informed with the latest cryptocurrency news, market analysis, and expert insights.
        </p>
      </motion.section>

      {/* News Feed */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <NewsFeed layout="card" />
      </motion.section>
    </div>
  )
}
