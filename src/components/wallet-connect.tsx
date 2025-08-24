"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Wallet, 
  Check, 
  Copy, 
  ExternalLink, 
  AlertCircle,
  Unlink,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"

interface WalletConnection {
  address: string
  network: string
  balance: number
  isConnected: boolean
  lastUpdated: Date
}

const SUPPORTED_NETWORKS = [
  { id: "ethereum", name: "Ethereum", symbol: "ETH", color: "bg-blue-500" },
  { id: "solana", name: "Solana", symbol: "SOL", color: "bg-purple-500" },
  { id: "bsc", name: "Binance Smart Chain", symbol: "BNB", color: "bg-yellow-500" },
  { id: "polygon", name: "Polygon", symbol: "MATIC", color: "bg-indigo-500" },
  { id: "avalanche", name: "Avalanche", symbol: "AVAX", color: "bg-red-500" },
  { id: "arbitrum", name: "Arbitrum", symbol: "ETH", color: "bg-blue-400" },
]

export function WalletConnect() {
  const [wallets, setWallets] = useState<WalletConnection[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [newWallet, setNewWallet] = useState({
    address: "",
    network: "",
  })
  const [error, setError] = useState("")
  const [copiedAddress, setCopiedAddress] = useState("")

  const validateAddress = (address: string, network: string): boolean => {
    if (!address || !network) return false
    
    // Basic validation patterns
    const patterns = {
      ethereum: /^0x[a-fA-F0-9]{40}$/,
      solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
      bsc: /^0x[a-fA-F0-9]{40}$/,
      polygon: /^0x[a-fA-F0-9]{40}$/,
      avalanche: /^0x[a-fA-F0-9]{40}$/,
      arbitrum: /^0x[a-fA-F0-9]{40}$/,
    }
    
    return patterns[network as keyof typeof patterns]?.test(address) || false
  }

  const connectWallet = async () => {
    setIsConnecting(true)
    setError("")

    try {
      if (!validateAddress(newWallet.address, newWallet.network)) {
        throw new Error("Invalid wallet address format")
      }

      // Check if wallet already exists
      if (wallets.some(w => w.address === newWallet.address && w.network === newWallet.network)) {
        throw new Error("Wallet already connected")
      }

      // Simulate API call to fetch balance
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock balance data
      const mockBalance = Math.random() * 100

      const newConnection: WalletConnection = {
        address: newWallet.address,
        network: newWallet.network,
        balance: mockBalance,
        isConnected: true,
        lastUpdated: new Date(),
      }

      setWallets(prev => [...prev, newConnection])
      setNewWallet({ address: "", network: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = (address: string, network: string) => {
    setWallets(prev => prev.filter(w => !(w.address === address && w.network === network)))
  }

  const refreshBalance = async (address: string, network: string) => {
    setWallets(prev => prev.map(wallet => {
      if (wallet.address === address && wallet.network === network) {
        return {
          ...wallet,
          balance: Math.random() * 100, // Mock new balance
          lastUpdated: new Date(),
        }
      }
      return wallet
    }))
  }

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      setTimeout(() => setCopiedAddress(""), 2000)
    } catch (error) {
      console.error("Failed to copy address")
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkConfig = (networkId: string) => {
    return SUPPORTED_NETWORKS.find(n => n.id === networkId)
  }

  return (
    <div className="space-y-6">
      {/* Add Wallet Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </CardTitle>
          <CardDescription>
            Add your wallet addresses to track your portfolio across multiple blockchains
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="network">Blockchain Network</Label>
              <Select value={newWallet.network} onValueChange={(value) => setNewWallet(prev => ({ ...prev, network: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_NETWORKS.map(network => (
                    <SelectItem key={network.id} value={network.id}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", network.color)} />
                        <span>{network.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {network.symbol}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Wallet Address</Label>
              <Input
                id="address"
                placeholder="Enter your wallet address"
                value={newWallet.address}
                onChange={(e) => setNewWallet(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>

          <Button 
            onClick={connectWallet} 
            disabled={!newWallet.address || !newWallet.network || isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Connecting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Connected Wallets */}
      {wallets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Wallets</CardTitle>
            <CardDescription>
              Manage your connected wallet addresses and view balances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wallets.map((wallet, index) => {
                const network = getNetworkConfig(wallet.network)
                return (
                  <motion.div
                    key={`${wallet.address}-${wallet.network}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-4 h-4 rounded-full", network?.color)} />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{network?.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {network?.symbol}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-mono">{formatAddress(wallet.address)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyAddress(wallet.address)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedAddress === wallet.address ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">
                          {wallet.balance.toFixed(4)} {network?.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Updated {wallet.lastUpdated.toLocaleTimeString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => refreshBalance(wallet.address, wallet.network)}
                          className="h-8 w-8 p-0"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => disconnectWallet(wallet.address, wallet.network)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Unlink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Support Info */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Networks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SUPPORTED_NETWORKS.map(network => (
              <div key={network.id} className="flex items-center gap-2 p-2 rounded-lg border">
                <div className={cn("w-3 h-3 rounded-full", network.color)} />
                <span className="text-sm font-medium">{network.name}</span>
                <Badge variant="secondary" className="text-xs ml-auto">
                  {network.symbol}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
