'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Wallet, Copy, Trash2, AlertCircle, Check } from 'lucide-react'

interface HoldingItem {
  symbol: string
  name: string
  logo?: string
  tokenAddress: string
  chain: string
  balance: string
  price: number
  priceChange24h: number
  marketValue: number
}

interface ManualAddressInputProps {
  onLoaded: (holdings: HoldingItem[], address: string, chain: string) => void
  onError?: (error: string) => void
}

interface SavedWallet {
  address: string
  updatedAt: number
}

type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export default function ManualAddressInput({ onLoaded, onError }: ManualAddressInputProps) {
  const [showManualMode, setShowManualMode] = useState(false)
  const [address, setAddress] = useState('')
  const [state, setState] = useState<LoadingState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [lastWallet, setLastWallet] = useState<SavedWallet | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load saved wallet from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('manualWalletETH')
      if (saved) {
        const wallet: SavedWallet = JSON.parse(saved)
        // Auto-expire after 1 hour
        if (Date.now() - wallet.updatedAt < 3600000) {
          setLastWallet(wallet)
          setAddress(wallet.address)
          setShowManualMode(true)
        } else {
          localStorage.removeItem('manualWalletETH')
        }
      }
    } catch (error) {
      console.warn('Failed to load saved wallet:', error)
    }
  }, [])

  const saveWallet = (address: string) => {
    try {
      const wallet: SavedWallet = {
        address,
        updatedAt: Date.now()
      }
      localStorage.setItem('manualWalletETH', JSON.stringify(wallet))
      setLastWallet(wallet)
    } catch (error) {
      console.warn('Failed to save wallet:', error)
    }
  }

  const clearWallet = () => {
    try {
      localStorage.removeItem('manualWalletETH')
      setLastWallet(null)
      setAddress('')
      setState('idle')
      setErrorMessage('')
    } catch (error) {
      console.warn('Failed to clear wallet:', error)
    }
  }

  const loadPortfolio = async (targetAddress?: string) => {
    const addressToLoad = targetAddress || address

    if (!addressToLoad.trim()) {
      setErrorMessage('Please enter an Ethereum address')
      setState('error')
      return
    }

    // Prevent double submission
    if (isSubmitting) return
    setIsSubmitting(true)

    setState('loading')
    setErrorMessage('')

    try {
      const response = await fetch(`/api/wallet/holdings?address=${encodeURIComponent(addressToLoad)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`)
      }

      if (!data.ok) {
        const errorMessages: Record<string, string> = {
          'INVALID_ADDRESS': 'Invalid Ethereum address format',
          'RATE_LIMIT': 'Too many requests. Please wait a moment.',
          'KEY_MISSING': 'Service temporarily unavailable',
          'UPSTREAM_DOWN': 'External service is down. Please try again later.',
          'SERVER_ERROR': 'Service error. Please try again later.'
        }
        
        throw new Error(errorMessages[data.code] || data.message || 'Failed to load portfolio')
      }

      const { holdings = [], address: resolvedAddress } = data
      
      saveWallet(resolvedAddress)
      onLoaded(holdings, resolvedAddress, 'eth')
      setState('success')

    } catch (error: any) {
      console.error('Load portfolio error:', error)
      const message = error.message || 'Failed to load portfolio'
      setErrorMessage(message)
      setState('error')
      onError?.(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadPortfolio()
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setAddress(text.trim())
    } catch (error) {
      console.warn('Failed to paste:', error)
    }
  }

  const validateAddress = (input: string): string | null => {
    if (!input.trim()) return 'Address is required'
    
    // Ethereum address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(input.trim())) {
      return 'Enter a valid Ethereum address (0x...)'
    }
    
    return null
  }

  const inputError = address ? validateAddress(address) : null
  const isFormValid = address.trim() && !inputError

  if (!showManualMode) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Wallet className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">Or use any Ethereum wallet</h3>
              <p className="text-sm text-muted-foreground">
                Enter any Ethereum address to view its portfolio
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowManualMode(true)}
              className="w-full"
            >
              Use Address Instead
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Ethereum Portfolio Lookup
        </CardTitle>
        <CardDescription>
          Enter any Ethereum address to view its cryptocurrency holdings
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Last used wallet */}
        {lastWallet && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">
                Last used: {lastWallet.address.slice(0, 6)}...{lastWallet.address.slice(-4)} on Ethereum
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadPortfolio(lastWallet.address)}
                disabled={isSubmitting}
              >
                Use Last
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ethereum Address</label>
            <div className="flex gap-2">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x... (Ethereum address)"
                className={inputError ? 'border-red-500' : ''}
                disabled={isSubmitting}
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePaste}
                disabled={isSubmitting}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {inputError && (
              <p className="text-sm text-red-500">{inputError}</p>
            )}
          </div>

          {/* Error Display */}
          {state === 'error' && errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {state === 'success' && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/10">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Portfolio loaded successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load Portfolio'
              )}
            </Button>
            
            {lastWallet && (
              <Button
                type="button"
                variant="outline"
                onClick={clearWallet}
                disabled={isSubmitting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>

        {/* Toggle back */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowManualMode(false)}
          disabled={isSubmitting}
          className="w-full text-sm"
        >
          Back to Wallet Connection
        </Button>
      </CardContent>
    </Card>
  )
}
