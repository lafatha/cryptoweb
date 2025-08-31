export interface MoralisTokenItem {
  symbol: string
  name: string
  logo?: string
  token_address: string
  balance: string
  decimals: number
  usd_price?: number
  usd_price_24hr_percent_change?: number
  usd_value?: number
}

export interface MoralisNativeItem {
  balance: string
}

export interface NormalizedHolding {
  symbol: string
  name: string
  logo?: string
  tokenAddress: string
  chain: string
  balance: string
  decimals: number
  price: number
  priceChange24h: number
  marketValue: number
}

export function formatUnits(balanceRaw: string, decimals: number): string {
  const divisor = BigInt(10 ** decimals)
  const quotient = BigInt(balanceRaw) / divisor
  const remainder = BigInt(balanceRaw) % divisor
  
  const quotientStr = quotient.toString()
  const remainderStr = remainder.toString().padStart(decimals, '0')
  
  // Remove trailing zeros from decimal part
  const trimmedRemainder = remainderStr.replace(/0+$/, '')
  
  if (trimmedRemainder === '') {
    return quotientStr
  }
  
  return `${quotientStr}.${trimmedRemainder}`
}

export function fromMoralisToken(item: MoralisTokenItem, chain: string): Partial<NormalizedHolding> {
  return {
    symbol: item.symbol || 'UNKNOWN',
    name: item.name || 'Unknown Token',
    logo: item.logo,
    tokenAddress: item.token_address,
    chain,
    balance: item.balance,
    decimals: item.decimals || 18,
    price: item.usd_price || 0,
    priceChange24h: item.usd_price_24hr_percent_change || 0
  }
}

export function fromMoralisNative(
  item: MoralisNativeItem, 
  chain: string, 
  nativeConfig: { symbol: string; name: string },
  price: number = 0,
  priceChange24h: number = 0
): NormalizedHolding {
  const balance = formatUnits(item.balance, 18)
  const marketValue = parseFloat(balance) * price
  
  return {
    symbol: nativeConfig.symbol,
    name: nativeConfig.name,
    tokenAddress: 'native',
    chain,
    balance: item.balance,
    decimals: 18,
    price,
    priceChange24h,
    marketValue
  }
}

export function toUIFormat(
  partialHolding: Partial<NormalizedHolding>,
  prices: Record<string, { usd: number; usd_24h_change?: number }> = {}
): NormalizedHolding {
  const {
    symbol = 'UNKNOWN',
    name = 'Unknown Token',
    logo,
    tokenAddress = '',
    chain = '',
    balance = '0',
    decimals = 18,
    price: providedPrice,
    priceChange24h: providedPriceChange
  } = partialHolding

  // Use provided price or lookup from prices
  const addressKey = tokenAddress.toLowerCase()
  const priceData = prices[addressKey]
  
  const price = providedPrice ?? priceData?.usd ?? 0
  const priceChange24h = providedPriceChange ?? priceData?.usd_24h_change ?? 0
  
  const formattedBalance = formatUnits(balance, decimals)
  const marketValue = parseFloat(formattedBalance) * price
  
  return {
    symbol,
    name,
    logo,
    tokenAddress,
    chain,
    balance,
    decimals,
    price,
    priceChange24h,
    marketValue
  }
}
