'use client'

import { useState, useEffect } from 'react'
import { useConnect, useAccount } from 'wagmi'
import { signIn } from 'next-auth/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { X, Wallet, Mail } from 'lucide-react'

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
  onEmailClick: () => void
}

const walletOptions = [
  {
    id: 'injected',
    name: 'MetaMask',
    description: 'Connect using browser wallet',
    icon: '🦊',
  },
  {
    id: 'walletConnect',
    name: 'WalletConnect',
    description: 'Scan with wallet to connect',
    icon: '🔗',
  },
  {
    id: 'walletConnect',
    name: 'Talisman',
    description: 'Connect with Talisman wallet',
    icon: '🔮',
  },
  {
    id: 'coinbaseWallet',
    name: 'Coinbase Wallet',
    description: 'Connect with Coinbase Wallet',
    icon: '🟦',
  },
]

export function WalletConnectModal({ isOpen, onClose, onEmailClick }: WalletConnectModalProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null)
  const { connect, connectors, error } = useConnect()
  const { isConnected, address } = useAccount()

  // Handle successful wallet connection
  useEffect(() => {
    if (isConnected && address && isConnecting) {
      handleWalletLogin(address)
    }
  }, [isConnected, address, isConnecting])

  const handleWalletLogin = async (walletAddress: string) => {
    try {
      // In production, you would:
      // 1. Generate a nonce on the server
      // 2. Have user sign the message with the nonce
      // 3. Verify the signature on the server
      // 4. Create a session

      // For demo, we'll just create a session with the address
      const result = await signIn('wallet', {
        address: walletAddress,
        signature: 'demo-signature', // In production, this would be a real signature
        message: `Login with wallet — nonce: ${Date.now()}`,
        redirect: false,
      })

      if (result?.ok) {
        onClose()
      } else {
        console.error('Wallet login failed:', result?.error)
      }
    } catch (error) {
      console.error('Wallet login error:', error)
    } finally {
      setIsConnecting(null)
    }
  }

  const handleConnect = async (connectorId: string) => {
    try {
      setIsConnecting(connectorId)
      
      const connector = connectors.find(c => {
        if (connectorId === 'injected') return c.id === 'injected'
        if (connectorId === 'walletConnect') return c.id === 'walletConnect'
        if (connectorId === 'coinbaseWallet') return c.id === 'coinbaseWallet'
        return false
      })

      if (connector) {
        connect({ connector })
      }
    } catch (error) {
      console.error('Connection error:', error)
      setIsConnecting(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown as any)
      return () => document.removeEventListener('keydown', handleKeyDown as any)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle>Connect with your wallet</DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 rounded-md"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Wallet Options */}
          <div className="space-y-2">
            {walletOptions.map((wallet) => (
              <Button
                key={`${wallet.id}-${wallet.name}`}
                variant="outline"
                className="w-full justify-start h-12 text-left"
                onClick={() => handleConnect(wallet.id)}
                disabled={isConnecting === wallet.id}
              >
                <span className="text-lg mr-3">{wallet.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{wallet.name}</div>
                  <div className="text-xs text-muted-foreground">{wallet.description}</div>
                </div>
                {isConnecting === wallet.id && (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
              </Button>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-lg">
              {error.message}
            </div>
          )}

          {/* Divider */}
          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-xs text-muted-foreground">
                Or create an account
              </span>
            </div>
          </div>

          {/* Email Option */}
          <Button
            variant="default"
            className="w-full h-12"
            onClick={onEmailClick}
          >
            <Mail className="w-4 h-4 mr-2" />
            Continue with email
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center pb-2">
          By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
        </div>
      </DialogContent>
    </Dialog>
  )
}
