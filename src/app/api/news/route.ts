import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import type { ArticleCard } from '@/types/article'

const mockNewsItems = [
  {
    id: '1',
    slug: 'bitcoin-etf-record-inflows',
    title: 'Bitcoin ETF Sees Record $2.3B Weekly Inflows as Institutional Adoption Accelerates',
    excerpt: 'Institutional adoption accelerates as Bitcoin ETFs see unprecedented weekly inflows, marking a new milestone in crypto mainstream acceptance.',
    category: 'CryptoFinance News',
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    slug: 'layer2-15b-tvl',
    title: 'Ethereum Layer 2 Ecosystem Reaches $15B TVL Milestone with 300% Growth',
    excerpt: 'Layer2 momentum continues as the Ethereum scaling ecosystem reaches new heights with massive TVL growth.',
    category: 'DeFi Weekly',
    published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  },
  {
    id: '3',
    slug: 'sec-crypto-regulations-q2',
    title: 'SEC Chairman Signals Clearer Crypto Regulations Coming in Q2 2024',
    excerpt: 'Regulatory clarity may be coming as SEC chairman indicates new frameworks for cryptocurrency oversight.',
    category: 'Regulatory Monitor',
    published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  },
  {
    id: '4',
    slug: 'solana-throughput-upgrade',
    title: 'Solana Network Upgrade Improves Throughput by 40%',
    excerpt: 'Performance improvements land on Solana mainnet, delivering significant throughput enhancements.',
    category: 'Tech Analytics',
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
  },
]

export async function GET() {
  try {
    // Try to fetch from Supabase first
    const { data, error } = await supabase
      .from('articles')
      .select('id, slug, title, excerpt, category, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false }) // Berita terbaru di depan
      .limit(30);

    if (error) {
      console.error('Supabase error:', error);
    }

    const items = (data ?? []) as ArticleCard[];

    // If no data from Supabase, use mock data
    const newsItems = items.length > 0 ? items : mockNewsItems;

    return NextResponse.json({
      items: newsItems,
      total: newsItems.length,
      lastUpdated: new Date().toISOString(),
      source: items.length > 0 ? 'supabase' : 'mock'
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
