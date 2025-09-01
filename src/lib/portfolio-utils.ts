import { formatUnits, parseUnits } from 'viem'
import type { TokenBalance } from '@/contexts/portfolio-context'

/**
 * Safely convert wei to formatted balance with proper decimal handling
 */
export function formatTokenBalance(balance: string, decimals: number, displayDecimals: number = 5): string {
  try {
    // Ensure balance is a valid number string
    if (!balance || balance === '' || isNaN(Number(balance))) {
      return '0.00000'
    }
    const formatted = formatUnits(BigInt(balance), decimals)
    const num = parseFloat(formatted)
    return num.toFixed(displayDecimals)
  } catch (error) {
    console.error('Error formatting token balance:', error)
    return '0.00000'
  }
}

/**
 * Safely calculate market value with proper precision
 */
export function calculateMarketValue(balance: string, decimals: number, price: number): number {
  try {
    // Ensure balance is a valid number string
    if (!balance || balance === '' || isNaN(Number(balance))) {
      return 0
    }
    const formattedBalance = formatUnits(BigInt(balance), decimals)
    const balanceNum = parseFloat(formattedBalance)
    return balanceNum * price
  } catch (error) {
    console.error('Error calculating market value:', error)
    return 0
  }
}

/**
 * Format currency with proper precision
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Aggregate token holdings by symbol/address to prevent duplicates
 */
export function aggregateTokenHoldings(holdings: TokenBalance[]): TokenBalance[] {
  const aggregatedMap = new Map<string, TokenBalance>()

  for (const holding of holdings) {
    // Use symbol as the key for aggregation
    const key = holding.symbol.toLowerCase()
    
    if (aggregatedMap.has(key)) {
      const existing = aggregatedMap.get(key)!
      
      // Aggregate balances safely
      try {
        const existingBalance = BigInt(existing.balance || '0')
        const newBalance = BigInt(holding.balance || '0')
        const totalBalance = existingBalance + newBalance
        
        // Calculate weighted average cost basis if both have cost basis
        let newCostBasis = existing.costBasis
        if (existing.costBasis && holding.costBasis) {
          const existingTokens = parseFloat(formatUnits(existingBalance, existing.decimals))
          const newTokens = parseFloat(formatUnits(newBalance, holding.decimals))
          const existingValue = existingTokens * existing.costBasis
          const newValue = newTokens * holding.costBasis
          const totalValue = existingValue + newValue
          const totalTokens = existingTokens + newTokens
          newCostBasis = totalTokens > 0 ? totalValue / totalTokens : existing.costBasis
        } else if (holding.costBasis && !existing.costBasis) {
          newCostBasis = holding.costBasis
        }

        // Use the most recent price data
        const price = holding.price || existing.price
        const priceChange24h = holding.priceChange24h ?? existing.priceChange24h

        // Calculate new market value using current price
        const newMarketValue = price ? 
          calculateMarketValue(totalBalance.toString(), existing.decimals, price) : 
          (existing.marketValue || 0) + (holding.marketValue || 0)

        // Merge notes if both have them
        const mergedNotes = [existing.notes, holding.notes]
          .filter(Boolean)
          .join('; ')

        // Keep the most comprehensive sparkline data
        const sparklineData = holding.sparklineData || existing.sparklineData

        // Update the aggregated holding
        aggregatedMap.set(key, {
          ...existing,
          balance: totalBalance.toString(),
          price,
          priceChange24h,
          marketValue: newMarketValue,
          costBasis: newCostBasis,
          notes: mergedNotes || undefined,
          sparklineData,
          isManual: existing.isManual || holding.isManual, // Mark as manual if either is manual
          // For manual entries, keep track of multiple IDs if needed
          manualEntryId: existing.manualEntryId || holding.manualEntryId,
        })
      } catch (error) {
        console.error('Error aggregating token balances:', error)
        // Fallback: keep the existing holding if aggregation fails
        aggregatedMap.set(key, existing)
      }
    } else {
      // First occurrence of this token
      aggregatedMap.set(key, { ...holding })
    }
  }

  // Convert back to array and sort by market value
  const aggregatedHoldings = Array.from(aggregatedMap.values())
  return aggregatedHoldings.sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0))
}

/**
 * Calculate portfolio totals with proper precision
 */
export function calculatePortfolioTotals(holdings: TokenBalance[]) {
  let totalValue = 0
  let totalValueChange = 0

  for (const holding of holdings) {
    const marketValue = holding.marketValue || 0
    totalValue += marketValue

    // Calculate 24h change contribution
    if (holding.priceChange24h && marketValue > 0) {
      const previousValue = marketValue / (1 + holding.priceChange24h / 100)
      totalValueChange += (marketValue - previousValue)
    }
  }

  return {
    totalValue: Math.round(totalValue * 100) / 100, // Round to 2 decimal places
    totalValueChange: Math.round(totalValueChange * 100) / 100
  }
}

/**
 * Calculate ROI for aggregated holdings
 */
export function calculateROI(currentValue: number, costBasis: number, balance: string, decimals: number): number | undefined {
  if (!costBasis || costBasis <= 0) return undefined
  
  try {
    const tokenAmount = parseFloat(formatUnits(BigInt(balance), decimals))
    const totalCost = tokenAmount * costBasis
    
    if (totalCost <= 0) return undefined
    
    return ((currentValue - totalCost) / totalCost) * 100
  } catch (error) {
    console.error('Error calculating ROI:', error)
    return undefined
  }
}
