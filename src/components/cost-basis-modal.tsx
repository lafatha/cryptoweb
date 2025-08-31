"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Upload, Trash2, DollarSign } from "lucide-react"

interface TokenBalance {
  symbol: string
  name: string
  balance: string
  decimals: number
  address: string
  price?: number
  priceChange24h?: number
  marketValue?: number
  costBasis?: number
  roi?: number
}

interface CostBasisModalProps {
  holdings: TokenBalance[]
  onSaveCostBasis: (costBasisData: Record<string, number>) => void
}

export function CostBasisModal({ holdings, onSaveCostBasis }: CostBasisModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [costBasisData, setCostBasisData] = useState<Record<string, number>>({})
  const [csvData, setCsvData] = useState('')

  const handleManualInput = (symbol: string, value: string) => {
    const numericValue = parseFloat(value)
    if (!isNaN(numericValue) && numericValue >= 0) {
      setCostBasisData(prev => ({
        ...prev,
        [symbol]: numericValue
      }))
    } else {
      setCostBasisData(prev => {
        const newData = { ...prev }
        delete newData[symbol]
        return newData
      })
    }
  }

  const handleCsvUpload = () => {
    try {
      const lines = csvData.trim().split('\n')
      const newCostBasisData: Record<string, number> = {}
      
      // Skip header line if present
      const dataLines = lines[0].toLowerCase().includes('symbol') ? lines.slice(1) : lines
      
      dataLines.forEach(line => {
        const [symbol, cost] = line.split(',').map(item => item.trim())
        const numericCost = parseFloat(cost)
        
        if (symbol && !isNaN(numericCost) && numericCost >= 0) {
          newCostBasisData[symbol.toUpperCase()] = numericCost
        }
      })
      
      setCostBasisData(prev => ({ ...prev, ...newCostBasisData }))
      setCsvData('')
    } catch (error) {
      console.error('Error parsing CSV:', error)
    }
  }

  const handleSave = () => {
    onSaveCostBasis(costBasisData)
    setIsOpen(false)
  }

  const getTotalCostBasis = () => {
    return Object.values(costBasisData).reduce((sum, cost) => sum + cost, 0)
  }

  const getCurrentMarketValue = () => {
    return holdings.reduce((sum, holding) => sum + (holding.marketValue || 0), 0)
  }

  const getTotalUnrealizedGains = () => {
    return getCurrentMarketValue() - getTotalCostBasis()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <DollarSign className="h-4 w-4" />
          Set Cost Basis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set Cost Basis</DialogTitle>
          <DialogDescription>
            Add cost basis for your holdings to track ROI and unrealized gains/losses
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="manual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Input</TabsTrigger>
            <TabsTrigger value="csv">Import CSV</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Manual Cost Basis Entry</CardTitle>
                <CardDescription>
                  Enter the total cost basis (amount you paid) for each asset in USD
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead className="text-right">Current Balance</TableHead>
                        <TableHead className="text-right">Market Value</TableHead>
                        <TableHead className="text-right">Cost Basis (USD)</TableHead>
                        <TableHead className="text-right">ROI</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holdings.map((holding) => {
                        const costBasis = costBasisData[holding.symbol] || 0
                        const marketValue = holding.marketValue || 0
                        const roi = costBasis > 0 ? ((marketValue - costBasis) / costBasis) * 100 : 0
                        
                        return (
                          <TableRow key={holding.symbol}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-bold">{holding.symbol.charAt(0)}</span>
                                </div>
                                <div>
                                  <div className="font-medium">{holding.symbol}</div>
                                  <div className="text-sm text-muted-foreground">{holding.name}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="font-medium">
                                {parseFloat(holding.balance) / Math.pow(10, holding.decimals) < 0.0001 
                                  ? '< 0.0001' 
                                  : (parseFloat(holding.balance) / Math.pow(10, holding.decimals)).toFixed(4)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(marketValue)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                value={costBasisData[holding.symbol] || ''}
                                onChange={(e) => handleManualInput(holding.symbol, e.target.value)}
                                className="w-24 text-right"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              {costBasis > 0 ? (
                                <Badge variant={roi >= 0 ? "default" : "destructive"}>
                                  {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="csv" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Import from CSV</CardTitle>
                <CardDescription>
                  Upload cost basis data from a CSV file. Format: Symbol,CostBasis (e.g., BTC,50000.00)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-data">CSV Data</Label>
                  <textarea
                    id="csv-data"
                    className="w-full min-h-[200px] p-3 border rounded-md resize-none font-mono text-sm"
                    placeholder={`Symbol,CostBasis
BTC,45000.00
ETH,3200.00
SOL,120.00`}
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                  />
                </div>
                <Button onClick={handleCsvUpload} disabled={!csvData.trim()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Parse CSV Data
                </Button>
                
                {Object.keys(costBasisData).length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Parsed Data Preview:</h4>
                    <div className="space-y-2">
                      {Object.entries(costBasisData).map(([symbol, cost]) => (
                        <div key={symbol} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="font-medium">{symbol}</span>
                          <span>{formatCurrency(cost)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Summary */}
        {Object.keys(costBasisData).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Cost Basis</p>
                  <p className="text-xl font-bold">{formatCurrency(getTotalCostBasis())}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Current Market Value</p>
                  <p className="text-xl font-bold">{formatCurrency(getCurrentMarketValue())}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Unrealized Gains/Loss</p>
                  <p className={`text-xl font-bold ${getTotalUnrealizedGains() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {getTotalUnrealizedGains() >= 0 ? '+' : ''}{formatCurrency(getTotalUnrealizedGains())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Actions */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setCostBasisData({})}
            disabled={Object.keys(costBasisData).length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={Object.keys(costBasisData).length === 0}>
              Save Cost Basis
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
