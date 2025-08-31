interface TokenPrice {
  usd: number
  usd_24h_change?: number
}

interface CoinGeckoPriceResponse {
  [address: string]: TokenPrice
}

export async function fetchCgTokenPrices(
  platform: string, 
  contracts: string[]
): Promise<Record<string, TokenPrice>> {
  if (contracts.length === 0) {
    return {}
  }

  try {
    const contractsParam = contracts.join(',')
    const url = `/api/coingecko/token-prices?platform=${platform}&contract_addresses=${contractsParam}&vs_currencies=usd&include_24hr_change=true`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.warn(`Failed to fetch token prices: ${response.status}`)
      return {}
    }
    
    const data: CoinGeckoPriceResponse = await response.json()
    
    // Normalize addresses to lowercase for consistent lookup
    const normalizedData: Record<string, TokenPrice> = {}
    Object.entries(data).forEach(([address, price]) => {
      normalizedData[address.toLowerCase()] = price
    })
    
    return normalizedData
  } catch (error) {
    console.error('Error fetching CoinGecko token prices:', error)
    return {}
  }
}

/**
 * Fetch token prices specifically for Ethereum network
 */
export async function fetchCgTokenPricesEthereum(contracts: string[]): Promise<Record<string, TokenPrice>> {
  return fetchCgTokenPrices('ethereum', contracts)
}

/**
 * Fetch ETH price from CoinGecko
 */
export async function fetchCgPriceEth(): Promise<TokenPrice> {
  try {
    const url = `/api/coingecko/simple-prices?ids=ethereum&vs_currencies=usd&include_24hr_change=true`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.warn(`Failed to fetch ETH price: ${response.status}`)
      return { usd: 0, usd_24h_change: 0 }
    }
    
    const data = await response.json()
    return data.ethereum || { usd: 0, usd_24h_change: 0 }
  } catch (error) {
    console.error('Error fetching ETH price:', error)
    return { usd: 0, usd_24h_change: 0 }
  }
}

export async function fetchSimplePrices(
  coinIds: string[],
  includePriceChange: boolean = true
): Promise<Record<string, TokenPrice>> {
  if (coinIds.length === 0) {
    return {}
  }

  try {
    const idsParam = coinIds.join(',')
    const changeParam = includePriceChange ? '&include_24hr_change=true' : ''
    const url = `/api/coingecko/simple-prices?ids=${idsParam}&vs_currencies=usd${changeParam}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.warn(`Failed to fetch simple prices: ${response.status}`)
      return {}
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching simple prices:', error)
    return {}
  }
}
