'use client'
import { useConnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function MetaMaskBtn() {
  const { connect, connectors, error } = useConnect()
  const metamask = connectors.find(c => c.id === 'injected') // MetaMask

  const handleConnect = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      if (metamask) {
        const loadingToast = toast.loading('Connecting to MetaMask...', {
          duration: 10000 // Will be dismissed manually
        })
        connect({ connector: metamask })
        // Note: success toast will be shown by WalletConnectModal
      } else {
        toast.error('MetaMask not detected. Please install MetaMask extension.', {
          duration: 4000
        })
      }
    } catch (error) {
      console.error('MetaMask connection error:', error)
      toast.error('Failed to connect to MetaMask', {
        duration: 4000
      })
    }
  }

  return (
    <Button
      type="button"                 // <- penting: bukan submit
      onClick={handleConnect}
      className="w-full rounded-xl px-4 py-3 h-12 justify-start"
      variant="outline"
      disabled={!metamask}
    >
      <span className="text-lg mr-3">🦊</span>
      <div className="flex-1 text-left">
        <div className="font-medium">MetaMask</div>
        <div className="text-xs text-muted-foreground">
          {!metamask ? 'MetaMask not detected' : 'Connect using browser wallet'}
        </div>
      </div>
      {!metamask && (
        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
          Not Installed
        </div>
      )}
    </Button>
  )
}
