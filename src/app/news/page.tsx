import ArticleCard from '@/components/ArticleCard';
import { supabase } from '@/lib/supabaseClient';
import type { ArticleCard as TCard } from '@/types/article';

export const revalidate = 60; // ISR: auto refresh tiap 60 detik

export default async function NewsPage() {
  // --- PRODUKSI: fetch dari Supabase ---
  const { data, error } = await supabase
    .from('articles')
    .select('id, slug, title, excerpt, category, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false }) // Berita terbaru di depan
    .limit(30);

  if (error) {
    console.error(error);
  }

  const items = (data ?? []) as TCard[];

  // --- jika belum ada ENV/DB: fallback mock (hapus jika sudah ready) ---
  if (!items.length) {
    const now = Date.now();
    const mock: TCard[] = [
      { id: '1', slug: 'bitcoin-etf-record-inflows', title: 'Bitcoin ETF Sees Record $2.3B Weekly Inflows as Institutional Adoption Accelerates', excerpt: 'Institutional adoption accelerates as Bitcoin ETFs see unprecedented weekly inflows, marking a new milestone in crypto mainstream acceptance.', category: 'Breaking News', published_at: new Date(now - 1*3600*1000).toISOString() },
      { id: '2', slug: 'layer2-15b-tvl', title: 'Ethereum Layer 2 Ecosystem Reaches $15B TVL Milestone with 300% Growth', excerpt: 'Layer2 momentum continues as the Ethereum scaling ecosystem reaches new heights with massive TVL growth year-over-year.', category: 'DeFi Weekly', published_at: new Date(now - 3*3600*1000).toISOString() },
      { id: '3', slug: 'solana-throughput-upgrade', title: 'Solana Network Upgrade Improves Throughput by 40%', excerpt: 'Performance improvements land on Solana mainnet, delivering significant throughput enhancements for developers and users.', category: 'Tech Analytics', published_at: new Date(now - 5*3600*1000).toISOString() },
      { id: '4', slug: 'defi-protocol-cross-chain', title: 'Major DeFi Protocol Launches Cross-Chain Bridge with $500M TVL', excerpt: 'Revolutionary cross-chain technology enables seamless asset transfers between major blockchain networks.', category: 'DeFi News', published_at: new Date(now - 8*3600*1000).toISOString() },
      { id: '5', slug: 'cbdc-pilot-programs', title: 'Central Bank Digital Currencies: 15 Countries Launch Pilot Programs', excerpt: 'Global adoption of CBDCs accelerates as major economies test digital currency infrastructure.', category: 'Global Finance', published_at: new Date(now - 12*3600*1000).toISOString() },
      { id: '6', slug: 'ai-defi-yield-farming', title: 'AI Meets DeFi: New Protocol Automates Yield Farming Strategies', excerpt: 'Artificial intelligence revolutionizes decentralized finance with automated yield optimization algorithms.', category: 'Innovation', published_at: new Date(now - 18*3600*1000).toISOString() }
    ];
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">News &amp; Insights</h1>
          <p className="text-muted-foreground text-lg">Stay informed with the latest cryptocurrency news, market analysis, and expert insights.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mock.map((a) => <ArticleCard key={a.id} a={a} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">News &amp; Insights</h1>
        <p className="text-muted-foreground text-lg">Stay informed with the latest cryptocurrency news, market analysis, and expert insights.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => <ArticleCard key={a.id} a={a} />)}
      </div>
    </div>
  );
}
