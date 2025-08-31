export interface ManualPortfolioEntry {
  id: string
  tokenId: string
  symbol: string
  name: string
  amount: number
  buyPrice: number
  notes?: string
  createdAt: string
}

export interface ManualPortfolioEntryWithPricing extends ManualPortfolioEntry {
  currentPrice?: number | null
  currentValue?: number | null
  pnl?: number | null
  pnlPercentage?: number | null
  priceChange24h?: number | null
}

const STORAGE_KEY = 'crypto-dashboard-manual-portfolio'

/**
 * Get all manual portfolio entries from local storage
 */
export function getManualPortfolioEntries(): ManualPortfolioEntry[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const entries = JSON.parse(stored)
    return Array.isArray(entries) ? entries : []
  } catch (error) {
    console.error('Error reading manual portfolio from localStorage:', error)
    return []
  }
}

/**
 * Save manual portfolio entries to local storage
 */
export function saveManualPortfolioEntries(entries: ManualPortfolioEntry[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch (error) {
    console.error('Error saving manual portfolio to localStorage:', error)
  }
}

/**
 * Add a new manual portfolio entry
 */
export function addManualPortfolioEntry(
  entry: Omit<ManualPortfolioEntry, 'id' | 'createdAt'>
): ManualPortfolioEntry {
  const newEntry: ManualPortfolioEntry = {
    ...entry,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  
  const existingEntries = getManualPortfolioEntries()
  const updatedEntries = [...existingEntries, newEntry]
  saveManualPortfolioEntries(updatedEntries)
  
  return newEntry
}

/**
 * Remove a manual portfolio entry
 */
export function removeManualPortfolioEntry(id: string): void {
  const existingEntries = getManualPortfolioEntries()
  const updatedEntries = existingEntries.filter(entry => entry.id !== id)
  saveManualPortfolioEntries(updatedEntries)
}

/**
 * Update a manual portfolio entry
 */
export function updateManualPortfolioEntry(
  id: string,
  updates: Partial<Omit<ManualPortfolioEntry, 'id' | 'createdAt'>>
): void {
  const existingEntries = getManualPortfolioEntries()
  const updatedEntries = existingEntries.map(entry =>
    entry.id === id ? { ...entry, ...updates } : entry
  )
  saveManualPortfolioEntries(updatedEntries)
}

/**
 * Enrich manual portfolio entries with current pricing data
 */
export function enrichManualEntriesWithPricing(
  entries: ManualPortfolioEntry[],
  coinPrices: Record<string, any>
): ManualPortfolioEntryWithPricing[] {
  return entries.map(entry => {
    const priceData = coinPrices[entry.tokenId]
    
    // Handle both null/undefined and actual price data
    const currentPrice = priceData?.usd || null
    const currentValue = currentPrice ? entry.amount * currentPrice : null
    const totalCost = entry.amount * entry.buyPrice
    const pnl = currentValue ? currentValue - totalCost : null
    const pnlPercentage = pnl && totalCost > 0 ? (pnl / totalCost) * 100 : null
    const priceChange24h = priceData?.usd_24h_change || null

    return {
      ...entry,
      currentPrice,
      currentValue,
      pnl,
      pnlPercentage,
      priceChange24h,
    }
  })
}

/**
 * Convert manual portfolio entries to the TokenBalance format used in portfolio display
 */
export function convertManualEntriesToTokenBalance(
  enrichedEntries: ManualPortfolioEntryWithPricing[]
): any[] {
  return enrichedEntries.map(entry => {
    // Convert amount to wei-like representation for consistency
    // Since manual entries are in decimal form, we multiply by 10^18
    const balanceInWei = (entry.amount * Math.pow(10, 18)).toString()
    
    return {
      symbol: entry.symbol,
      name: entry.name,
      balance: balanceInWei,
      decimals: 18, // Standardize to 18 decimals for consistency
      address: `manual-${entry.id}`,
      price: entry.currentPrice,
      priceChange24h: entry.priceChange24h,
      marketValue: entry.currentValue,
      costBasis: entry.buyPrice,
      roi: entry.pnlPercentage,
      sparklineData: generateSparklineData(entry.currentPrice || entry.buyPrice, entry.priceChange24h || 0),
      isManual: true,
      manualEntryId: entry.id,
      notes: entry.notes,
    }
  })
}

/**
 * Generate simple ID for manual entries
 */
function generateId(): string {
  return `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate sparkline data for manual entries
 */
function generateSparklineData(price: number, change: number) {
  const data = []
  for (let i = 0; i < 24; i++) {
    const hourlyChange = change / 24
    const value = price - change + (hourlyChange * i) + (Math.random() - 0.5) * price * 0.01
    data.push({
      time: new Date(Date.now() - (24 - i) * 3600000).toISOString(),
      value: Math.max(0, value)
    })
  }
  return data
}

/**
 * Get unique token IDs from manual entries for price fetching
 */
export function getTokenIdsFromManualEntries(entries: ManualPortfolioEntry[]): string[] {
  return [...new Set(entries.map(entry => entry.tokenId))]
}
