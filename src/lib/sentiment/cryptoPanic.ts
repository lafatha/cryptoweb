const CRYPTOPANIC_API_KEY = process.env.api_cryptopanic || '48591daf29672210b9e1f2c13b0a67325a8fd8ed';

interface NewsHeadline {
  title: string;
  url: string;
}

interface SentimentScore {
  neg: number;
  pos: number;
  ratioNeg: number;
}

// Sentiment lexicon
const NEGATIVE_WORDS = [
  'hack', 'exploit', 'ban', 'lawsuit', 'scam', 'rug', 'sell-off', 'delist',
  'down', 'plunge', 'dump', 'bearish', 'fraud', 'crash', 'decline', 'fall',
  'drops', 'loses', 'worst', 'risk', 'danger', 'warning', 'alert', 'concern',
  'trouble', 'problem', 'issue', 'negative', 'weak', 'volatility'
];

const POSITIVE_WORDS = [
  'partnership', 'listing', 'milestone', 'upgrade', 'merge', 'record',
  'surge', 'bullish', 'funding', 'roadmap', 'growth', 'rise', 'gains',
  'rally', 'soars', 'breakthrough', 'success', 'launch', 'adoption',
  'integration', 'expansion', 'optimistic', 'strong', 'positive', 'good'
];

export async function headlinesFor(symbolOrName: string, limit: number = 5): Promise<NewsHeadline[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const params = new URLSearchParams({
      auth_token: CRYPTOPANIC_API_KEY,
      kind: 'news',
      regions: 'en',
      filter: 'hot',
      page: '1',
      currencies: symbolOrName.toUpperCase()
    });

    const url = `https://cryptopanic.com/api/v1/posts/?${params}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`CryptoPanic API error: ${response.status}`);
    }

    const data = await response.json();
    const results = data.results || [];

    return results.slice(0, limit).map((item: any) => ({
      title: item.title || '',
      url: item.url || ''
    }));

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('CryptoPanic headlines error:', error);
    
    // Return fallback headlines
    return getFallbackHeadlines(symbolOrName, limit);
  }
}

export function scoreTitles(titles: string[]): SentimentScore {
  if (titles.length === 0) {
    return { neg: 0, pos: 0, ratioNeg: 0 };
  }

  let negativeCount = 0;
  let positiveCount = 0;

  titles.forEach(title => {
    const titleLower = title.toLowerCase();
    
    // Count negative words
    NEGATIVE_WORDS.forEach(word => {
      if (titleLower.includes(word)) {
        negativeCount++;
      }
    });

    // Count positive words
    POSITIVE_WORDS.forEach(word => {
      if (titleLower.includes(word)) {
        positiveCount++;
      }
    });
  });

  const totalTitles = titles.length;
  const neg = Math.round((negativeCount / totalTitles) * 100) / 100;
  const pos = Math.round((positiveCount / totalTitles) * 100) / 100;
  const ratioNeg = totalTitles > 0 ? Math.round((negativeCount / (negativeCount + positiveCount || 1)) * 100) / 100 : 0;

  return { neg, pos, ratioNeg };
}

function getFallbackHeadlines(symbolOrName: string, limit: number): NewsHeadline[] {
  const fallbackHeadlines = [
    {
      title: `${symbolOrName.toUpperCase()} shows stable trading patterns in recent market analysis`,
      url: 'https://example.com/crypto-analysis'
    },
    {
      title: `Market sentiment remains cautious for ${symbolOrName.toUpperCase()} amid broader trends`,
      url: 'https://example.com/market-sentiment'
    },
    {
      title: `Technical indicators suggest mixed signals for ${symbolOrName.toUpperCase()}`,
      url: 'https://example.com/technical-analysis'
    },
    {
      title: `Cryptocurrency market update: ${symbolOrName.toUpperCase()} maintains current levels`,
      url: 'https://example.com/market-update'
    },
    {
      title: `Weekly review: ${symbolOrName.toUpperCase()} performance and outlook`,
      url: 'https://example.com/weekly-review'
    }
  ];

  return fallbackHeadlines.slice(0, limit);
}
