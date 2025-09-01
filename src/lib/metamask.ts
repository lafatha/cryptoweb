/**
 * Utility functions for MetaMask detection and handling
 */

export interface EthereumProvider {
  isMetaMask?: boolean
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on: (event: string, handler: (data: any) => void) => void
  removeListener: (event: string, handler: (data: any) => void) => void
  selectedAddress?: string | null
  chainId?: string
  providers?: EthereumProvider[]
}

declare global {
  interface Window {
    ethereum?: any // Changed to any to avoid type conflicts
  }
}

/**
 * Check if MetaMask is installed and available
 */
export function isMetaMaskInstalled(): boolean {
  if (typeof window === 'undefined') return false
  
  const { ethereum } = window
  
  if (!ethereum) return false
  
  // Check for MetaMask directly
  if (ethereum.isMetaMask) return true
  
  // Check for MetaMask in providers array (for cases where multiple wallets are installed)
  if (ethereum.providers && Array.isArray(ethereum.providers)) {
    return ethereum.providers.some((provider: any) => provider.isMetaMask)
  }
  
  return false
}

/**
 * Get the MetaMask provider from multiple providers
 */
export function getMetaMaskProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') return null
  
  const { ethereum } = window
  
  if (!ethereum) return null
  
  // If there's only one provider and it's MetaMask
  if (ethereum.isMetaMask && !ethereum.providers) {
    return ethereum
  }
  
  // If there are multiple providers, find MetaMask
  if (ethereum.providers && Array.isArray(ethereum.providers)) {
    return ethereum.providers.find((provider: any) => provider.isMetaMask) || null
  }
  
  return null
}

/**
 * Check if user is connected to MetaMask
 */
export async function isMetaMaskConnected(): Promise<boolean> {
  const provider = getMetaMaskProvider()
  
  if (!provider) return false
  
  try {
    const accounts = await provider.request({ method: 'eth_accounts' })
    return Array.isArray(accounts) && accounts.length > 0
  } catch (error) {
    console.error('Error checking MetaMask connection:', error)
    return false
  }
}

/**
 * Get MetaMask accounts
 */
export async function getMetaMaskAccounts(): Promise<string[]> {
  const provider = getMetaMaskProvider()
  
  if (!provider) return []
  
  try {
    const accounts = await provider.request({ method: 'eth_accounts' })
    return Array.isArray(accounts) ? accounts : []
  } catch (error) {
    console.error('Error getting MetaMask accounts:', error)
    return []
  }
}

/**
 * Get current MetaMask chain ID
 */
export async function getMetaMaskChainId(): Promise<string | null> {
  const provider = getMetaMaskProvider()
  
  if (!provider) return null
  
  try {
    const chainId = await provider.request({ method: 'eth_chainId' })
    return chainId
  } catch (error) {
    console.error('Error getting MetaMask chain ID:', error)
    return null
  }
}

/**
 * Request MetaMask account access
 */
export async function requestMetaMaskAccounts(): Promise<string[]> {
  const provider = getMetaMaskProvider()
  
  if (!provider) {
    throw new Error('MetaMask is not installed')
  }
  
  try {
    const accounts = await provider.request({ method: 'eth_requestAccounts' })
    return Array.isArray(accounts) ? accounts : []
  } catch (error) {
    console.error('Error requesting MetaMask accounts:', error)
    throw error
  }
}

/**
 * Switch MetaMask to a specific chain
 */
export async function switchMetaMaskChain(chainId: string): Promise<void> {
  const provider = getMetaMaskProvider()
  
  if (!provider) {
    throw new Error('MetaMask is not installed')
  }
  
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    })
  } catch (error: any) {
    // If the chain hasn't been added to MetaMask, add it
    if (error.code === 4902) {
      throw new Error('Chain not added to MetaMask')
    }
    throw error
  }
}

/**
 * Listen to MetaMask account changes
 */
export function onMetaMaskAccountsChanged(callback: (accounts: string[]) => void): () => void {
  const provider = getMetaMaskProvider()
  
  if (!provider) {
    return () => {} // Return empty cleanup function
  }
  
  const handleAccountsChanged = (accounts: string[]) => {
    callback(accounts)
  }
  
  provider.on('accountsChanged', handleAccountsChanged)
  
  // Return cleanup function
  return () => {
    provider.removeListener('accountsChanged', handleAccountsChanged)
  }
}

/**
 * Listen to MetaMask chain changes
 */
export function onMetaMaskChainChanged(callback: (chainId: string) => void): () => void {
  const provider = getMetaMaskProvider()
  
  if (!provider) {
    return () => {} // Return empty cleanup function
  }
  
  const handleChainChanged = (chainId: string) => {
    callback(chainId)
  }
  
  provider.on('chainChanged', handleChainChanged)
  
  // Return cleanup function
  return () => {
    provider.removeListener('chainChanged', handleChainChanged)
  }
}

/**
 * Common MetaMask error messages
 */
export const METAMASK_ERRORS = {
  NOT_INSTALLED: 'MetaMask is not installed',
  USER_REJECTED: 'User rejected the request',
  UNAUTHORIZED: 'Unauthorized access',
  UNSUPPORTED_METHOD: 'Unsupported method',
  DISCONNECTED: 'MetaMask is disconnected',
  CHAIN_DISCONNECTED: 'Chain is disconnected',
} as const

/**
 * Parse MetaMask error messages
 */
export function parseMetaMaskError(error: any): string {
  if (!error) return 'Unknown error'
  
  const message = error.message || error.toString()
  
  if (message.includes('User rejected') || error.code === 4001) {
    return METAMASK_ERRORS.USER_REJECTED
  }
  
  if (message.includes('Unauthorized') || error.code === 4100) {
    return METAMASK_ERRORS.UNAUTHORIZED
  }
  
  if (message.includes('Unsupported method') || error.code === 4200) {
    return METAMASK_ERRORS.UNSUPPORTED_METHOD
  }
  
  if (message.includes('disconnected') || error.code === 4900) {
    return METAMASK_ERRORS.DISCONNECTED
  }
  
  if (error.code === 4901) {
    return METAMASK_ERRORS.CHAIN_DISCONNECTED
  }
  
  return message
}
