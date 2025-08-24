'use client'
import { useConnect, useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'

export function MetaMaskBtn() {
  const { connect, connectors, error } = useConnect()
  const { isConnected } = useAccount()
  const metamask = connectors.find(c => c.id === 'injected') // MetaMask

  const handleConnect = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Jika sudah connected, jangan connect lagi
    if (isConnected) {
      return
    }
    
    try {
      if (metamask) {
        connect({ connector: metamask })
        // Note: tidak ada toast notification
      } else {
        console.error('MetaMask not detected')
      }
    } catch (error) {
      console.error('MetaMask connection error:', error)
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
