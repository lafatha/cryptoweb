-- Create wallets table to store connected wallet addresses
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  wallet_type TEXT NOT NULL, -- 'metamask', 'walletconnect', etc.
  is_active BOOLEAN DEFAULT true,
  last_connected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallet_portfolios table to store asset holdings per wallet
CREATE TABLE IF NOT EXISTS wallet_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL REFERENCES wallets(wallet_address) ON DELETE CASCADE,
  asset_symbol TEXT NOT NULL, -- 'BTC', 'ETH', 'ADA', etc.
  amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
  buy_price DECIMAL(20, 8), -- Optional: user's average buy price
  notes TEXT, -- Optional: user notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one record per wallet-asset combination
  UNIQUE(wallet_address, asset_symbol)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallets_active ON wallets(is_active);
CREATE INDEX IF NOT EXISTS idx_portfolio_wallet ON wallet_portfolios(wallet_address);
CREATE INDEX IF NOT EXISTS idx_portfolio_symbol ON wallet_portfolios(asset_symbol);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_wallet_portfolios_updated_at 
  BEFORE UPDATE ON wallet_portfolios 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_portfolios ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all operations - you can restrict later)
CREATE POLICY "Allow all operations on wallets" ON wallets FOR ALL USING (true);
CREATE POLICY "Allow all operations on wallet_portfolios" ON wallet_portfolios FOR ALL USING (true);
