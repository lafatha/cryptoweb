import { NextResponse } from 'next/server'

const mockNewsItems = [
  {
    id: '1',
    title: 'Bitcoin ETF Sees Record $2.3B Weekly Inflows as Institutional Adoption Accelerates',
    url: 'https://example.com/bitcoin-etf-record-inflows',
    source: 'CryptoFinance News',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    title: 'Ethereum Layer 2 Ecosystem Reaches $15B TVL Milestone with 300% Growth',
    url: 'https://example.com/ethereum-layer2-milestone',
    source: 'DeFi Weekly',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  },
  {
    id: '3',
    title: 'SEC Chairman Signals Clearer Crypto Regulations Coming in Q2 2024',
    url: 'https://example.com/sec-crypto-regulations-q2',
    source: 'Regulatory Monitor',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  },
  {
    id: '4',
    title: 'Solana Network Upgrade Improves Throughput by 40%',
    url: 'https://example.com/solana-network-upgrade',
    source: 'Tech Analytics',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
  },
  {
    id: '5',
    title: 'Global Crypto Market Cap Reaches New All-Time High of $2.8T',
    url: 'https://example.com/crypto-market-cap-ath',
    source: 'Market Intelligence',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
  },
  {
    id: '6',
    title: 'Major DeFi Protocol Launches Cross-Chain Bridge with $500M TVL',
    url: 'https://example.com/defi-cross-chain-bridge',
    source: 'DeFi Insights',
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
  },
  {
    id: '7',
    title: 'Central Bank Digital Currencies: 15 Countries Launch Pilot Programs',
    url: 'https://example.com/cbdc-pilot-programs',
    source: 'Global Finance',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: '8',
    title: 'Bitcoin Mining Operations Report Record Efficiency Gains',
    url: 'https://example.com/bitcoin-mining-efficiency',
    source: 'Mining Weekly',
    publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30 hours ago
  },
  {
    id: '9',
    title: 'Artificial Intelligence Meets DeFi: New Protocol Automates Yield Farming',
    url: 'https://example.com/ai-defi-yield-farming',
    source: 'Innovation Today',
    publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36 hours ago
  }
]

export async function GET() {
  try {
    // In production, this would fetch from a real news API
    // For now, return curated mock data
    return NextResponse.json({
      items: mockNewsItems,
      total: mockNewsItems.length,
      lastUpdated: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' // Cache for 5 minutes
      }
    })
  } catch (error) {
    console.error('Error in news API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}
