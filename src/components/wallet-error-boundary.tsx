'use client'

import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class WalletErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Wallet Error Boundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    // Clear any cached wallet data
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('wagmi.connected')
        localStorage.removeItem('wagmi.wallet')
        localStorage.removeItem('wagmi.cache')
        localStorage.removeItem('wagmi.store')
      } catch (error) {
        console.warn('Failed to clear localStorage:', error)
      }
    }

    this.setState({ hasError: false, error: undefined })
    
    // Reload the page to ensure clean state
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-3">
            <div>
              <strong>Wallet Connection Error</strong>
              <p className="text-sm mt-1">
                There was an error with the wallet connection. This is usually caused by:
              </p>
              <ul className="text-sm mt-2 list-disc list-inside space-y-1">
                <li>MetaMask extension conflicts</li>
                <li>Network connectivity issues</li>
                <li>Browser cache corruption</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReset}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Reset Connection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Reload Page
              </Button>
            </div>
            {this.state.error && (
              <details className="text-xs text-muted-foreground">
                <summary>Technical Details</summary>
                <pre className="mt-2 whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}

// Hook untuk menangani wallet errors secara programmatic
export function useWalletErrorHandler() {
  const handleWalletError = React.useCallback((error: Error, context?: string) => {
    console.error(`Wallet Error${context ? ` (${context})` : ''}:`, error)
    
    // Handle specific MetaMask errors
    if (error.message.includes('User rejected')) {
      console.log('User rejected the wallet connection')
      return
    }
    
    if (error.message.includes('Already processing')) {
      console.log('Wallet connection already in progress')
      return
    }
    
    if (error.message.includes('No provider')) {
      console.error('No wallet provider detected')
      return
    }
    
    // For other errors, you might want to show a toast or alert
    console.error('Unhandled wallet error:', error)
  }, [])

  const resetWalletState = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('wagmi.connected')
        localStorage.removeItem('wagmi.wallet')
        localStorage.removeItem('wagmi.cache')
        localStorage.removeItem('wagmi.store')
      } catch (error) {
        console.warn('Failed to clear localStorage:', error)
      }
    }
  }, [])

  return { handleWalletError, resetWalletState }
}
