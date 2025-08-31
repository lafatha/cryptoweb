export interface ChainConfig {
  key: string
  name: string
  cgPlatform: string
  native: {
    symbol: string
    name: string
  }
  rpcUrl?: string
  blockExplorer?: string
}

export const CHAINS: ChainConfig[] = [
  {
    key: 'eth',
    name: 'Ethereum',
    cgPlatform: 'ethereum',
    native: {
      symbol: 'ETH',
      name: 'Ethereum'
    },
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io'
  },
  {
    key: 'bsc',
    name: 'BSC',
    cgPlatform: 'binance-smart-chain',
    native: {
      symbol: 'BNB',
      name: 'BNB'
    },
    rpcUrl: 'https://bsc.llamarpc.com',
    blockExplorer: 'https://bscscan.com'
  },
  {
    key: 'polygon',
    name: 'Polygon',
    cgPlatform: 'polygon-pos',
    native: {
      symbol: 'MATIC',
      name: 'Polygon'
    },
    rpcUrl: 'https://polygon.llamarpc.com',
    blockExplorer: 'https://polygonscan.com'
  },
  {
    key: 'arbitrum',
    name: 'Arbitrum',
    cgPlatform: 'arbitrum-one',
    native: {
      symbol: 'ETH',
      name: 'Ethereum'
    },
    rpcUrl: 'https://arbitrum.llamarpc.com',
    blockExplorer: 'https://arbiscan.io'
  },
  {
    key: 'optimism',
    name: 'Optimism',
    cgPlatform: 'optimistic-ethereum',
    native: {
      symbol: 'ETH',
      name: 'Ethereum'
    },
    rpcUrl: 'https://optimism.llamarpc.com',
    blockExplorer: 'https://optimistic.etherscan.io'
  },
  {
    key: 'base',
    name: 'Base',
    cgPlatform: 'base',
    native: {
      symbol: 'ETH',
      name: 'Ethereum'
    },
    rpcUrl: 'https://base.llamarpc.com',
    blockExplorer: 'https://basescan.org'
  }
]

export function getChainConfig(key: string): ChainConfig | undefined {
  return CHAINS.find(chain => chain.key === key)
}

export function getChainByPlatform(platform: string): ChainConfig | undefined {
  return CHAINS.find(chain => chain.cgPlatform === platform)
}

export function isHexAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value)
}

export function toChecksum(address: string): string {
  if (!isHexAddress(address)) {
    throw new Error('Invalid hex address')
  }
  
  // Simple checksum implementation using built-in methods
  const addr = address.toLowerCase().replace('0x', '')
  
  // For now, just return lowercased - in production you'd want to use ethers or viem
  return '0x' + addr
}

export function isENS(input: string): boolean {
  return input.includes('.eth') || input.includes('.crypto') || input.includes('.nft')
}

export function normalizeInput(input: string): string {
  return input.trim().toLowerCase().replace(/^\$/, '')
}
