import { supabase, testSupabaseConnection } from './supabaseClient'

export interface WalletPortfolio {
  id?: string
  wallet_address: string
  asset_symbol: string
  amount: number
  buy_price?: number
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface SavedWallet {
  id?: string
  wallet_address: string
  wallet_type: string // 'metamask', 'walletconnect', etc.
  is_active: boolean
  last_connected: string
  created_at?: string
}

// Save wallet to database when user connects
export async function saveWalletConnection(
  walletAddress: string, 
  walletType: string
): Promise<SavedWallet | null> {
  try {
    // Validate inputs
    if (!walletAddress || !walletType) {
      console.error('Error saving wallet: Missing wallet address or type')
      return null
    }

    // Test connection first
    const isConnected = await testSupabaseConnection()
    if (!isConnected) {
      console.error('Error saving wallet: Database connection failed')
      return null
    }

    // Check if wallet already exists
    const { data: existingWallet, error: selectError } = await supabase
      .from('wallets')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .maybeSingle() // Use maybeSingle instead of single to avoid error when no record found

    // If there's an error in the select query (not just no record found)
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing wallet:', selectError)
      return null
    }

    if (existingWallet) {
      // Update last connected time
      const { data, error } = await supabase
        .from('wallets')
        .update({ 
          is_active: true,
          last_connected: new Date().toISOString(),
          wallet_type: walletType
        })
        .eq('wallet_address', walletAddress.toLowerCase())
        .select()
        .single()

      if (error) {
        console.error('Error updating wallet:', error)
        return null
      }
      return data
    } else {
      // Create new wallet record
      const { data, error } = await supabase
        .from('wallets')
        .insert({
          wallet_address: walletAddress.toLowerCase(),
          wallet_type: walletType,
          is_active: true,
          last_connected: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating wallet:', error)
        return null
      }
      return data
    }
  } catch (error) {
    console.error('Error saving wallet:', error instanceof Error ? error.message : error)
    return null
  }
}

// Set wallet as inactive when user disconnects
export async function disconnectWallet(walletAddress: string): Promise<boolean> {
  try {
    if (!walletAddress) {
      console.error('Error disconnecting wallet: Missing wallet address')
      return false
    }

    const { error } = await supabase
      .from('wallets')
      .update({ is_active: false })
      .eq('wallet_address', walletAddress.toLowerCase())

    if (error) {
      console.error('Error disconnecting wallet:', error)
      return false
    }
    return true
  } catch (error) {
    console.error('Error disconnecting wallet:', error instanceof Error ? error.message : error)
    return false
  }
}

// Get portfolio for a specific wallet
export async function getWalletPortfolio(walletAddress: string): Promise<WalletPortfolio[]> {
  try {
    if (!walletAddress) {
      console.error('Error fetching wallet portfolio: Missing wallet address')
      return []
    }

    const { data, error } = await supabase
      .from('wallet_portfolios')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching wallet portfolio:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error fetching wallet portfolio:', error instanceof Error ? error.message : error)
    return []
  }
}

// Add asset to wallet portfolio
export async function addAssetToWalletPortfolio(
  walletAddress: string,
  assetSymbol: string,
  amount: number,
  buyPrice?: number,
  notes?: string
): Promise<WalletPortfolio | null> {
  try {
    // Check if asset already exists for this wallet
    const { data: existingAsset } = await supabase
      .from('wallet_portfolios')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('asset_symbol', assetSymbol.toUpperCase())
      .single()

    if (existingAsset) {
      // Update existing asset
      const { data, error } = await supabase
        .from('wallet_portfolios')
        .update({
          amount: amount,
          buy_price: buyPrice,
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAsset.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Create new asset entry
      const { data, error } = await supabase
        .from('wallet_portfolios')
        .insert({
          wallet_address: walletAddress.toLowerCase(),
          asset_symbol: assetSymbol.toUpperCase(),
          amount: amount,
          buy_price: buyPrice,
          notes: notes
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('Error adding asset to wallet portfolio:', error)
    return null
  }
}

// Remove asset from wallet portfolio
export async function removeAssetFromWalletPortfolio(
  walletAddress: string,
  assetId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('wallet_portfolios')
      .delete()
      .eq('id', assetId)
      .eq('wallet_address', walletAddress.toLowerCase())

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error removing asset from wallet portfolio:', error)
    return false
  }
}

// Get saved wallet info
export async function getSavedWallet(walletAddress: string): Promise<SavedWallet | null> {
  try {
    if (!walletAddress) {
      console.error('Error fetching saved wallet: Missing wallet address')
      return null
    }

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('is_active', true)
      .maybeSingle() // Use maybeSingle instead of single to avoid error when no record found

    if (error) {
      console.error('Error fetching saved wallet:', error)
      return null
    }
    return data
  } catch (error) {
    console.error('Error fetching saved wallet:', error instanceof Error ? error.message : error)
    return null
  }
}
