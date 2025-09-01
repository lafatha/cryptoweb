"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CryptoIcon } from "@/components/crypto-icon"
import { Plus } from "lucide-react"

// Available tokens for manual entry (using CoinGecko IDs for price fetching)
const VERIFIED_TOKENS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'matic-network', symbol: 'MATIC', name: 'Polygon' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap' },
  { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos' },
  { id: 'ethereum-classic', symbol: 'ETC', name: 'Ethereum Classic' },
  { id: 'monero', symbol: 'XMR', name: 'Monero' },
  { id: 'stellar', symbol: 'XLM', name: 'Stellar' },
  { id: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash' },
  { id: 'algorand', symbol: 'ALGO', name: 'Algorand' },
  { id: 'hedera-hashgraph', symbol: 'HBAR', name: 'Hedera' },
  { id: 'vechain', symbol: 'VET', name: 'VeChain' },
  { id: 'filecoin', symbol: 'FIL', name: 'Filecoin' },
  { id: 'internet-computer', symbol: 'ICP', name: 'Internet Computer' },
  { id: 'aptos', symbol: 'APT', name: 'Aptos' },
  { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum' },
  { id: 'optimism', symbol: 'OP', name: 'Optimism' },
  { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu' },
  { id: 'near', symbol: 'NEAR', name: 'NEAR Protocol' },
]

export interface ManualPortfolioEntry {
  id: string
  tokenId: string
  symbol: string
  name: string
  amount: number
  buyPrice: number
  notes?: string
  createdAt: string
}

interface ManualPortfolioModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (entry: Omit<ManualPortfolioEntry, 'id' | 'createdAt'>) => void
}

export function ManualPortfolioModal({ isOpen, onClose, onSubmit }: ManualPortfolioModalProps) {
  const [selectedToken, setSelectedToken] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [buyPrice, setBuyPrice] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  // Filter tokens based on search query
  const filteredTokens = VERIFIED_TOKENS.filter(token => {
    const searchLower = searchQuery.toLowerCase()
    return token.name.toLowerCase().includes(searchLower) ||
           token.symbol.toLowerCase().includes(searchLower) ||
           token.id.toLowerCase().includes(searchLower)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedToken || !amount || !buyPrice) {
      return
    }

    const token = VERIFIED_TOKENS.find(t => t.id === selectedToken)
    if (!token) return

    setIsSubmitting(true)

    try {
      await onSubmit({
        tokenId: token.id,
        symbol: token.symbol,
        name: token.name,
        amount: parseFloat(amount),
        buyPrice: parseFloat(buyPrice),
        notes: notes.trim() || undefined,
      })

      // Reset form
      setSelectedToken('')
      setAmount('')
      setBuyPrice('')
      setNotes('')
      setSearchQuery('')
      onClose()
    } catch (error) {
      console.error('Error adding manual portfolio entry:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedToken('')
      setAmount('')
      setBuyPrice('')
      setNotes('')
      setSearchQuery('')
      onClose()
    }
  }

  const selectedTokenData = VERIFIED_TOKENS.find(t => t.id === selectedToken)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Asset to Portfolio
          </DialogTitle>
          <DialogDescription>
            Manually add a cryptocurrency asset to track its performance alongside your wallet holdings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="token">Asset</Label>
            <div className="relative">
              <Input
                placeholder="Search cryptocurrency (e.g., Bitcoin, BTC)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-2"
              />
              {searchQuery && (
                <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                  {filteredTokens.length > 0 ? (
                    filteredTokens.map((token) => (
                      <button
                        key={token.id}
                        type="button"
                        onClick={() => {
                          setSelectedToken(token.id)
                          setSearchQuery(`${token.symbol} - ${token.name}`)
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <CryptoIcon symbol={token.symbol} size={20} />
                        <span className="font-medium">{token.symbol}</span>
                        <span className="text-muted-foreground">{token.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-muted-foreground text-center">
                      No assets found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              {selectedTokenData && (
                <p className="text-xs text-muted-foreground">
                  Amount of {selectedTokenData.symbol} you own
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyPrice">Buy Price (USD)</Label>
              <Input
                id="buyPrice"
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Average purchase price per token
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this holding..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {selectedToken && amount && buyPrice && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm font-medium">Summary</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Asset: {selectedTokenData?.name} ({selectedTokenData?.symbol})</p>
                <p>Amount: {amount} {selectedTokenData?.symbol}</p>
                <p>Average Buy Price: ${buyPrice}</p>
                <p>Total Investment: ${(parseFloat(amount) * parseFloat(buyPrice)).toFixed(2)}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedToken || !amount || !buyPrice || isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Asset'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
