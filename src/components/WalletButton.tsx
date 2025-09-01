'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance, useDisconnect, useSwitchChain, useSignMessage } from 'wagmi'
import { mainnet, polygon, bsc } from 'wagmi/chains'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Copy, Network, MessageSquare, LogOut, ChevronDown } from 'lucide-react'

const chainConfig = {
  [mainnet.id]: { name: 'Ethereum', symbol: 'ETH', color: 'bg-gray-600' },
  [polygon.id]: { name: 'Polygon', symbol: 'MATIC', color: 'bg-gray-500' },
  [bsc.id]: { name: 'BSC', symbol: 'BNB', color: 'bg-gray-700' },
}

interface WalletButtonProps {
  onConnect?: () => void // Make optional
}

export function WalletButton({ onConnect }: WalletButtonProps) {
  const { address, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({ address })
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { signMessage } = useSignMessage()
  const [isMobile, setIsMobile] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Debug log untuk memonitor state changes
  useEffect(() => {
    console.log('WalletButton state changed:', { 
      isConnected, 
      address: address || 'null', 
      chain: chain?.name || 'null' 
    })
  }, [isConnected, address, chain])

  // Monitor disconnect events
  useEffect(() => {
    if (!isConnected && !address) {
      console.log('Wallet has been disconnected - state cleared')
      setIsDisconnecting(false)
    }
  }, [isConnected, address])

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatBalance = (bal: any) => {
    if (!bal) return '0.00'
    const value = parseFloat(bal.formatted)
    return value.toFixed(4)
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      // Tidak ada toast notification
    }
  }

  const handleSwitchNetwork = (chainId: number) => {
    switchChain({ chainId: chainId as 1 | 137 | 56 })
  }

  const handleSignMessage = async () => {
    try {
      const message = 'Hello from CryptoFinance!'
      const signature = await signMessage({ message })
      console.log('Signature:', signature)
    } catch (error) {
      console.error('Sign message error:', error)
    }
  }

  const handleDisconnect = async () => {
    if (isDisconnecting) return // Prevent multiple disconnect calls
    
    try {
      setIsDisconnecting(true)
      console.log('Disconnecting wallet...')
      
      // Clear any cached data first
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('wagmi.connected')
          localStorage.removeItem('wagmi.wallet')
          localStorage.removeItem('wagmi.cache')
        } catch (error) {
          console.warn('Failed to clear localStorage:', error)
        }
      }
      
      // Call disconnect
      disconnect()
      
      console.log('Disconnect called successfully')
      
      // Force state reset after a short delay
      setTimeout(() => {
        setIsDisconnecting(false)
      }, 1000)
      
    } catch (error) {
      console.error('Disconnect error:', error)
      setIsDisconnecting(false)
    }
  }

  // Early return jika tidak ada address dan tidak connected, atau sedang disconnecting
  if (!isConnected || !address) {
    return (
      <Button 
        onClick={onConnect || (() => {})}
        className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-2xl px-6 border-none"
        disabled={isDisconnecting}
      >
        {/* Wallet Icon */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
          <path d="M12.6667 3.33331H3.33333C2.59695 3.33331 2 3.93027 2 4.66665V11.3333C2 12.0697 2.59695 12.6666 3.33333 12.6666H12.6667C13.403 12.6666 14 12.0697 14 11.3333V4.66665C14 3.93027 13.403 3.33331 12.6667 3.33331Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 6.66669H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.6667 9.33331H10.6733" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {isDisconnecting ? 'Disconnecting...' : 'Connect Wallet'}
      </Button>
    )
  }

  const currentChain = chain ? chainConfig[chain.id as keyof typeof chainConfig] : null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          {currentChain && (
            <div className={`w-2 h-2 rounded-full ${currentChain.color}`} />
          )}
          <span className="font-mono">
            {isMobile ? formatAddress(address!) : address ? formatAddress(address) : 'Wallet'}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        {/* Account Info */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Account</span>
            <Badge variant="secondary" className="text-xs">
              Connected
            </Badge>
          </div>
          <div className="font-mono text-sm">{formatAddress(address!)}</div>
          {balance && currentChain && (
            <div className="text-sm text-muted-foreground">
              {formatBalance(balance)} {currentChain.symbol}
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Actions */}
        <DropdownMenuItem onClick={copyAddress}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>

        {/* Network Switching */}
        <DropdownMenuItem className="flex-col items-start p-0">
          <div className="px-2 py-1.5 w-full">
            <div className="flex items-center mb-2">
              <Network className="w-4 h-4 mr-2" />
              Switch Network
            </div>
            <div className="space-y-1">
              {Object.entries(chainConfig).map(([chainId, config]) => (
                <button
                  key={chainId}
                  onClick={() => handleSwitchNetwork(parseInt(chainId))}
                  className="w-full text-left px-2 py-1 text-sm rounded hover:bg-muted flex items-center gap-2"
                >
                  <div className={`w-2 h-2 rounded-full ${config.color}`} />
                  {config.name}
                  {chain?.id === parseInt(chainId) && (
                    <Badge variant="secondary" className="text-xs ml-auto">
                      Active
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSignMessage}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Sign Message
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDisconnect} className="text-gray-600 dark:text-gray-300">
          <LogOut className="w-4 h-4 mr-2" />
          {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
