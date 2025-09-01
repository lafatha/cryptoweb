'use client'
import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function MetaMaskBtn() {
  const { connect, connectors, error, isPending } = useConnect()
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false)
  
  // Find injected connector (MetaMask)
  const injectedConnector = connectors.find(c => c.id === 'injected')

  // Check if MetaMask is available
  useEffect(() => {
    const checkMetaMask = () => {
      if (typeof window !== 'undefined') {
        const hasEthereum = typeof window.ethereum !== 'undefined'
        const hasMetaMask = hasEthereum && (
          window.ethereum.isMetaMask || 
          window.ethereum.providers?.some((p: any) => p.isMetaMask)
        )
        setIsMetaMaskAvailable(hasMetaMask)
        console.log('MetaMask check:', { hasEthereum, hasMetaMask, connectors: connectors.length })
      }
    }
    
    checkMetaMask()
    
    // Check again after a delay
    const timer = setTimeout(checkMetaMask, 1000)
    
    return () => clearTimeout(timer)
  }, [connectors])

  const handleConnect = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isConnected) {
      console.log('Already connected')
      return
    }
    
    if (!isMetaMaskAvailable) {
      console.log('MetaMask not available, opening install page')
      window.open('https://metamask.io/download/', '_blank')
      return
    }
    
    if (!injectedConnector) {
      console.error('Injected connector not found in:', connectors.map(c => ({ id: c.id, name: c.name })))
      return
    }
    
    try {
      console.log('Attempting to connect with connector:', injectedConnector.id)
      await connect({ connector: injectedConnector })
    } catch (error) {
      console.error('Connection error:', error)
    }
  }

  const handleDisconnect = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      await disconnect()
      console.log('Disconnected successfully')
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  // Debug info
  useEffect(() => {
    console.log('Connector status:', {
      connectorsCount: connectors.length,
      connectorIds: connectors.map(c => c.id),
      injectedFound: !!injectedConnector,
      isMetaMaskAvailable,
      isConnected,
      address
    })
  }, [connectors, injectedConnector, isMetaMaskAvailable, isConnected, address])

  // Show connected state
  if (isConnected && address) {
    return (
      <Button
        type="button"
        onClick={handleDisconnect}
        className="w-full rounded-xl px-4 py-3 h-12 justify-start"
        variant="outline"
      >
        <span className="text-lg mr-3">🦊</span>
        <div className="flex-1 text-left">
          <div className="font-medium">MetaMask Connected</div>
          <div className="text-xs text-muted-foreground">
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </div>
        </div>
        <div className="text-xs text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded">
          Connected
        </div>
      </Button>
    )
  }

  return (
    <Button
      type="button"
      onClick={handleConnect}
      className="w-full rounded-xl px-4 py-3 h-12 justify-start"
      variant="outline"
      disabled={isPending}
    >
      <span className="text-lg mr-3">🦊</span>
      <div className="flex-1 text-left">
        <div className="font-medium">MetaMask</div>
        <div className="text-xs text-muted-foreground">
          {!isMetaMaskAvailable 
            ? 'Click to install MetaMask' 
            : isPending 
            ? 'Connecting...'
            : error
            ? `Error: ${error.message}`
            : 'Connect using browser wallet'
          }
        </div>
      </div>
      {!isMetaMaskAvailable && (
        <div className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300 px-2 py-1 rounded">
          Install
        </div>
      )}
      {isPending && (
        <div className="text-xs text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
          Connecting...
        </div>
      )}
      {error && (
        <div className="text-xs text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded">
          Error
        </div>
      )}
    </Button>
  )
}
