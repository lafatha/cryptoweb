'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance, useDisconnect, useSwitchChain, useSignMessage } from 'wagmi'
import { mainnet, polygon, bsc } from 'wagmi/chains'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Copy, Network, MessageSquare, LogOut, ChevronDown } from 'lucide-react'

const chainConfig = {
  [mainnet.id]: { name: 'Ethereum', symbol: 'ETH', color: 'bg-blue-500' },
  [polygon.id]: { name: 'Polygon', symbol: 'MATIC', color: 'bg-purple-500' },
  [bsc.id]: { name: 'BSC', symbol: 'BNB', color: 'bg-yellow-500' },
}

interface WalletButtonProps {
  onConnect: () => void
}

export function WalletButton({ onConnect }: WalletButtonProps) {
  const { address, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({ address })
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { signMessage } = useSignMessage()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
      toast.success('Address copied to clipboard')
    }
  }

  const handleSwitchNetwork = (chainId: number) => {
    switchChain({ chainId })
  }

  const handleSignMessage = async () => {
    try {
      const message = 'Hello from CryptoFinance!'
      const signature = await signMessage({ message })
      toast.success('Message signed successfully!')
      console.log('Signature:', signature)
    } catch (error) {
      toast.error('Failed to sign message')
      console.error('Sign message error:', error)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast.success('Wallet disconnected')
  }

  if (!isConnected) {
    return (
      <Button onClick={onConnect} variant="outline" size="sm">
        Connect Wallet
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

        <DropdownMenuItem onClick={handleDisconnect} className="text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
