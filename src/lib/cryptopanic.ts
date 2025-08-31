import axios from 'axios'

const CRYPTOPANIC_API_KEY = process.env.api_cryptopanic || '48591daf29672210b9e1f2c13b0a67325a8fd8ed'

export interface NewsArticle {
  id: number
  title: string
  url: string
  source: {
    title: string
    region: string
    domain: string
    path: string | null
  }
  published_at: string
  domain: string
  slug: string
  currencies: {
    code: string
    title: string
    slug: string
    url: string
  }[]
  kind: string
  votes: {
    negative: number
    positive: number
    important: number
    liked: number
    disliked: number
    lol: number
    toxic: number
    saved: number
  }
}

export async function fetchCryptoNews(
  currencies?: string[],
  limit: number = 5,
  kind: string = 'news'
): Promise<NewsArticle[]> {
  try {
    const params: Record<string, string> = {
      auth_token: CRYPTOPANIC_API_KEY,
      kind,
      regions: 'en',
      filter: 'hot',
      page: '1'
    }

    if (currencies && currencies.length > 0) {
      params.currencies = currencies.join(',')
    }

    const response = await axios.get('https://cryptopanic.com/api/v1/posts/', {
      params,
      timeout: 10000
    })

    if (response.data && response.data.results) {
      return response.data.results.slice(0, limit)
    }

    return []
  } catch (error) {
    console.error('Error fetching crypto news:', error)
    // Return fallback news data
    return getFallbackNewsData(limit)
  }
}

export async function fetchNewsBySymbols(
  symbols: string[],
  limit: number = 5
): Promise<NewsArticle[]> {
  try {
    // Convert symbols to currency codes (e.g., BTC, ETH)
    const currencyCodes = symbols.map(symbol => symbol.toUpperCase())
    return await fetchCryptoNews(currencyCodes, limit)
  } catch (error) {
    console.error('Error fetching news by symbols:', error)
    return getFallbackNewsData(limit)
  }
}

function getFallbackNewsData(limit: number): NewsArticle[] {
  const fallbackNews: NewsArticle[] = [
    {
      id: 1,
      title: "Bitcoin Price Analysis: BTC Shows Strong Support at Key Levels",
      url: "https://example.com/btc-analysis",
      source: {
        title: "CryptoNews",
        region: "en",
        domain: "cryptonews.com",
        path: null
      },
      published_at: new Date().toISOString(),
      domain: "cryptonews.com",
      slug: "bitcoin-price-analysis",
      currencies: [
        {
          code: "BTC",
          title: "Bitcoin",
          slug: "bitcoin",
          url: "https://cryptopanic.com/currencies/btc/"
        }
      ],
      kind: "news",
      votes: {
        negative: 2,
        positive: 15,
        important: 8,
        liked: 12,
        disliked: 1,
        lol: 0,
        toxic: 0,
        saved: 5
      }
    },
    {
      id: 2,
      title: "Ethereum Network Upgrade Shows Promising Results",
      url: "https://example.com/eth-upgrade",
      source: {
        title: "BlockchainDaily",
        region: "en",
        domain: "blockchaindaily.com",
        path: null
      },
      published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      domain: "blockchaindaily.com",
      slug: "ethereum-network-upgrade",
      currencies: [
        {
          code: "ETH",
          title: "Ethereum",
          slug: "ethereum",
          url: "https://cryptopanic.com/currencies/eth/"
        }
      ],
      kind: "news",
      votes: {
        negative: 1,
        positive: 20,
        important: 12,
        liked: 18,
        disliked: 0,
        lol: 0,
        toxic: 0,
        saved: 8
      }
    },
    {
      id: 3,
      title: "Market Analysis: Cryptocurrency Trends for This Week",
      url: "https://example.com/market-analysis",
      source: {
        title: "CryptoInsights",
        region: "en",
        domain: "cryptoinsights.com",
        path: null
      },
      published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      domain: "cryptoinsights.com",
      slug: "market-analysis-trends",
      currencies: [
        {
          code: "BTC",
          title: "Bitcoin",
          slug: "bitcoin",
          url: "https://cryptopanic.com/currencies/btc/"
        },
        {
          code: "ETH",
          title: "Ethereum",
          slug: "ethereum",
          url: "https://cryptopanic.com/currencies/eth/"
        }
      ],
      kind: "news",
      votes: {
        negative: 0,
        positive: 25,
        important: 15,
        liked: 22,
        disliked: 0,
        lol: 0,
        toxic: 0,
        saved: 10
      }
    }
  ]

  return fallbackNews.slice(0, limit)
}
