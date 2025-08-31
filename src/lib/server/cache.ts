interface CacheEntry {
  data: any
  expires: number
}

// In-memory cache for API responses
export const cache = new Map<string, CacheEntry>()

// Track pending promises to prevent duplicate requests
export const pending = new Map<string, Promise<any>>()

/**
 * Get cached data if not expired
 */
export function getCached(key: string): any | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  
  if (Date.now() > entry.expires) {
    cache.delete(key)
    return undefined
  }
  
  return entry.data
}

/**
 * Set cache with TTL
 */
export function setCached(key: string, data: any, ttlMs: number = 20000): void {
  cache.set(key, {
    data,
    expires: Date.now() + ttlMs
  })
}

/**
 * Get or create pending promise
 */
export async function withDeduplication<T>(
  key: string,
  factory: () => Promise<T>
): Promise<T> {
  // Check if there's already a pending request for this key
  const existingPromise = pending.get(key)
  if (existingPromise) {
    return existingPromise
  }

  // Create new promise and track it
  const promise = factory().finally(() => {
    // Clean up pending promise when done
    pending.delete(key)
  })

  pending.set(key, promise)
  return promise
}

/**
 * Simple rate limiter per IP
 */
const rateLimits = new Map<string, number[]>()

export function isRateLimited(ip: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now()
  const requests = rateLimits.get(ip) || []
  
  // Filter out old requests
  const recentRequests = requests.filter(time => now - time < windowMs)
  
  if (recentRequests.length >= maxRequests) {
    return true
  }
  
  // Add current request
  recentRequests.push(now)
  rateLimits.set(ip, recentRequests)
  
  return false
}
