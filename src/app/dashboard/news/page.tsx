"use client"

import { motion } from "framer-motion"
import { NewsFeed } from "@/components/news-feed"

export default function DashboardNewsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Cryptocurrency News</h1>
        <p className="text-muted-foreground">
          Latest news and updates from the cryptocurrency world
        </p>
      </div>

      {/* News Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <NewsFeed />
      </motion.div>
    </div>
  )
}
