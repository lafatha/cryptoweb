'use client'

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Wallet, Mail } from 'lucide-react'
import { MetaMaskBtn } from '@/components/MetaMaskBtn'
import { toast } from 'sonner'

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
  onEmailClick: () => void
}

// Komponen untuk WalletConnect dengan Coming Soon
function WalletConnectBtn() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toast.info('WalletConnect integration coming soon!', {
      duration: 2000
    })
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      className="w-full rounded-xl px-4 py-3 h-12 justify-start"
      variant="outline"
    >
      <span className="text-lg mr-3">🔗</span>
      <div className="flex-1 text-left">
        <div className="font-medium">WalletConnect</div>
        <div className="text-xs text-muted-foreground">Scan with wallet to connect</div>
      </div>
      <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
        Coming Soon
      </div>
    </Button>
  )
}

// Komponen untuk Coinbase dengan Coming Soon
function CoinbaseBtn() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toast.info('Coinbase Wallet integration coming soon!', {
      duration: 2000
    })
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      className="w-full rounded-xl px-4 py-3 h-12 justify-start"
      variant="outline"
    >
      <span className="text-lg mr-3">🟦</span>
      <div className="flex-1 text-left">
        <div className="font-medium">Coinbase Wallet</div>
        <div className="text-xs text-muted-foreground">Connect with Coinbase Wallet</div>
      </div>
      <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
        Coming Soon
      </div>
    </Button>
  )
}

export function WalletConnectModal({ isOpen, onClose, onEmailClick }: WalletConnectModalProps) {
  const { isConnected, address } = useAccount()

  // Handle successful wallet connection
  useEffect(() => {
    if (isConnected && address && isOpen) {
      // Dismiss any loading toasts
      toast.dismiss()
      // Show success message
      toast.success('Wallet connected successfully!', { 
        duration: 2000 
      })
      // Close modal
      setTimeout(() => {
        onClose()
      }, 500)
      console.log('Wallet connected:', address)
    }
  }, [isConnected, address, isOpen, onClose])

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
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle>Connect with your wallet</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Wallet Options */}
          <div className="space-y-3">
            <MetaMaskBtn />
            <WalletConnectBtn />
            <CoinbaseBtn />
          </div>

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
            type="button"
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
