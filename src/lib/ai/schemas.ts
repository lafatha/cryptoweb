import { z } from 'zod'

export const InsightSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(10),
  severity: z.enum(['info', 'warning', 'danger']),
  confidence: z.number().min(0).max(1)
})

export const WatchlistItemSchema = z.object({
  symbol: z.string(),
  reason: z.string()
})

export const AnalysisSchema = z.object({
  insights: z.array(InsightSchema).min(3).max(6),
  watchlist: z.array(WatchlistItemSchema).max(3).optional()
})

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(2000)
})

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(20),
  context: z.object({
    topHoldings: z.array(z.object({
      symbol: z.string(),
      value: z.number(),
      change24h: z.number().optional()
    })).optional(),
    marketBrief: z.string().optional()
  }).optional()
})

export type Insight = z.infer<typeof InsightSchema>
export type WatchlistItem = z.infer<typeof WatchlistItemSchema>
export type Analysis = z.infer<typeof AnalysisSchema>
export type ChatMessage = z.infer<typeof ChatMessageSchema>
export type ChatRequest = z.infer<typeof ChatRequestSchema>
