'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink, Clock } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  url: string
  source: string
  publishedAt: string
}

interface NewsFeedProps {
  items?: NewsItem[]
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  return `${Math.floor(diffInHours / 24)}d ago`
}

const SkeletonCard = () => (
  <Card className="overflow-hidden hover:shadow-md transition-shadow">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-16 h-4 bg-muted animate-pulse rounded" />
        <div className="w-12 h-3 bg-muted animate-pulse rounded" />
      </div>
      <div className="space-y-2">
        <div className="w-full h-4 bg-muted animate-pulse rounded" />
        <div className="w-3/4 h-4 bg-muted animate-pulse rounded" />
      </div>
      <div className="w-20 h-3 bg-muted animate-pulse rounded" />
    </CardContent>
  </Card>
)

export function NewsFeed({ items }: NewsFeedProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        if (items) {
          setNewsItems(items)
          setIsLoading(false)
          return
        }

        const response = await fetch('/api/news')
        if (!response.ok) throw new Error('Failed to fetch news')
        
        const data = await response.json()
        setNewsItems(data.items || [])
      } catch (error) {
        console.error('Error fetching news:', error)
        // Use fallback data if API fails
        setNewsItems([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [items])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {newsItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card 
            className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group h-full"
            onClick={() => window.open(item.url, '_blank')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                window.open(item.url, '_blank')
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Read article: ${item.title}`}
          >
            <CardContent className="p-4 space-y-3 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium">{item.source}</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(item.publishedAt)}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors flex-1">
                {item.title}
              </h3>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                  Read more
                </div>
                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}