'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { 
  isMetaMaskInstalled, 
  getMetaMaskProvider, 
  onMetaMaskAccountsChanged, 
  onMetaMaskChainChanged,
  parseMetaMaskError,
  getMetaMaskAccounts,
  getMetaMaskChainId 
} from '@/lib/metamask'

export interface UseMetaMaskReturn {
  // State
  isInstalled: boolean
  isConnected: boolean
  isConnecting: boolean
  address: string | null
  chainId: string | null
  error: string | null
  
  // Actions
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  switchChain: (chainId: string) => Promise<void>
  
  // Utils
  clearError: () => void
  resetConnection: () => void
}

export function useMetaMask(): UseMetaMaskReturn {
  const { address, isConnected: wagmiConnected } = useAccount()
  const { connect: wagmiConnect, connectors, isPending } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  
  const [isInstalled, setIsInstalled] = useState(false)
  const [chainId, setChainId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  
  const metamaskConnector = connectors.find(c => c.id === 'injected')
  
  // Check MetaMask installation
  useEffect(() => {
    const checkInstallation = () => {
      const installed = isMetaMaskInstalled()
      setIsInstalled(installed)
      
      if (!installed) {
        setError('MetaMask is not installed')
      } else {
        setError(null)
      }
    }
    
    checkInstallation()
    
    // Listen for MetaMask installation
    const handleEthereumChanged = () => {
      checkInstallation()
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('ethereum#initialized', handleEthereumChanged)
      
      // Check again after delay for delayed injection
      const timer = setTimeout(checkInstallation, 1000)
      
      return () => {
        window.removeEventListener('ethereum#initialized', handleEthereumChanged)
        clearTimeout(timer)
      }
    }
  }, [])
  
  // Get chain ID when connected
  useEffect(() => {
    if (wagmiConnected && isInstalled) {
      getMetaMaskChainId().then(setChainId).catch(console.error)
    } else {
      setChainId(null)
    }
  }, [wagmiConnected, isInstalled])
  
  // Listen to MetaMask events
  useEffect(() => {
    if (!isInstalled) return
    
    const unsubscribeAccounts = onMetaMaskAccountsChanged((accounts) => {
      console.log('MetaMask accounts changed:', accounts)
      
      if (accounts.length === 0 && wagmiConnected) {
        // User disconnected from MetaMask directly
        console.log('Disconnecting due to MetaMask account change')
        wagmiDisconnect()
      }
    })
    
    const unsubscribeChain = onMetaMaskChainChanged((newChainId) => {
      console.log('MetaMask chain changed:', newChainId)
      setChainId(newChainId)
    })
    
    return () => {
      unsubscribeAccounts()
      unsubscribeChain()
    }
  }, [isInstalled, wagmiConnected, wagmiDisconnect])
  
  // Connect function
  const connect = useCallback(async () => {
    if (!isInstalled) {
      setError('MetaMask is not installed')
      window.open('https://metamask.io/download/', '_blank')
      return
    }
    
    if (wagmiConnected) {
      console.log('Already connected')
      return
    }
    
    if (!metamaskConnector) {
      setError('MetaMask connector not available')
      return
    }
    
    setIsConnecting(true)
    setError(null)
    
    try {
      console.log('Connecting to MetaMask...')
      await wagmiConnect({ connector: metamaskConnector })
    } catch (error) {
      const errorMessage = parseMetaMaskError(error)
      setError(errorMessage)
      console.error('MetaMask connection error:', error)
    } finally {
      setIsConnecting(false)
    }
  }, [isInstalled, wagmiConnected, metamaskConnector, wagmiConnect])
  
  // Disconnect function
  const disconnect = useCallback(async () => {
    if (!wagmiConnected) {
      console.log('Not connected')
      return
    }
    
    setError(null)
    
    try {
      // Clear localStorage first
      if (typeof window !== 'undefined') {
        const keys = ['wagmi.connected', 'wagmi.wallet', 'wagmi.cache', 'wagmi.store']
        keys.forEach(key => {
          try {
            localStorage.removeItem(key)
          } catch (error) {
            console.warn(`Failed to remove ${key}:`, error)
          }
        })
      }
      
      console.log('Disconnecting from MetaMask...')
      await wagmiDisconnect()
      setChainId(null)
    } catch (error) {
      const errorMessage = parseMetaMaskError(error)
      setError(errorMessage)
      console.error('MetaMask disconnect error:', error)
    }
  }, [wagmiConnected, wagmiDisconnect])
  
  // Switch chain function
  const switchChain = useCallback(async (targetChainId: string) => {
    if (!isInstalled) {
      setError('MetaMask is not installed')
      return
    }
    
    const provider = getMetaMaskProvider()
    if (!provider) {
      setError('MetaMask provider not available')
      return
    }
    
    setError(null)
    
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      })
      
      setChainId(targetChainId)
    } catch (error: any) {
      if (error.code === 4902) {
        setError('Chain not added to MetaMask')
      } else {
        const errorMessage = parseMetaMaskError(error)
        setError(errorMessage)
      }
      console.error('Chain switch error:', error)
    }
  }, [isInstalled])
  
  // Clear error function
  const clearError = useCallback(() => {
    setError(null)
  }, [])
  
  // Reset connection function
  const resetConnection = useCallback(async () => {
    console.log('Resetting MetaMask connection...')
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      const keys = ['wagmi.connected', 'wagmi.wallet', 'wagmi.cache', 'wagmi.store']
      keys.forEach(key => {
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.warn(`Failed to remove ${key}:`, error)
        }
      })
    }
    
    // Disconnect if connected
    if (wagmiConnected) {
      try {
        await wagmiDisconnect()
      } catch (error) {
        console.error('Error during reset disconnect:', error)
      }
    }
    
    // Clear state
    setError(null)
    setChainId(null)
    setIsConnecting(false)
    
    console.log('MetaMask connection reset complete')
  }, [wagmiConnected, wagmiDisconnect])
  
  return {
    // State
    isInstalled,
    isConnected: wagmiConnected,
    isConnecting: isConnecting || isPending,
    address: address || null,
    chainId,
    error,
    
    // Actions
    connect,
    disconnect,
    switchChain,
    
    // Utils
    clearError,
    resetConnection,
  }
}
