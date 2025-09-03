import { NextResponse } from 'next/server';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MORALIS_BASE = 'https://deep-index.moralis.io/api/v2.2';

interface TokenBalance {
  token_address: string;
  name: string;
  symbol: string;
  logo?: string;
  thumbnail?: string;
  decimals: number;
  balance: string;
  balance_formatted: string;
  usd_price?: number;
  usd_value?: number;
  portfolio_percentage?: number;
}

interface WalletPortfolio {
  address: string;
  chain: string;
  totalValueUSD: number;
  tokenCount: number;
  tokens: TokenBalance[];
  lastUpdated: string;
}

export async function GET(request: Request) {
  try {
    const { MORALIS_API_KEY } = process.env;

    if (!MORALIS_API_KEY) {
      return NextResponse.json({
        ok: false,
        code: "NO_API_KEY",
        message: "Moralis API tidak dikonfigurasi"
      }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || 'eth'; // Default Ethereum

    if (!address) {
      return NextResponse.json({
        ok: false,
        code: "BAD_REQUEST",
        message: "Parameter 'address' diperlukan"
      }, { status: 400 });
    }

    // Validate address format (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({
        ok: false,
        code: "BAD_REQUEST",
        message: "Format address wallet tidak valid"
      }, { status: 400 });
    }

    try {
      // Get token balances from Moralis
      const response = await fetch(
        `${MORALIS_BASE}/${address}/erc20?chain=${chain}&include=percent_relative`,
        {
          headers: {
            'Accept': 'application/json',
            'X-API-Key': MORALIS_API_KEY
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error(`Moralis API error: ${response.status}`);
      }

      const data = await response.json();
      const tokens = data.result || [];

      // Get native token balance (ETH, BNB, etc.)
      let nativeBalance = null;
      try {
        const nativeResponse = await fetch(
          `${MORALIS_BASE}/${address}/balance?chain=${chain}`,
          {
            headers: {
              'Accept': 'application/json',
              'X-API-Key': MORALIS_API_KEY
            },
            cache: 'no-store'
          }
        );

        if (nativeResponse.ok) {
          const nativeData = await nativeResponse.json();
          if (nativeData.balance && parseFloat(nativeData.balance) > 0) {
            nativeBalance = {
              token_address: '0x0000000000000000000000000000000000000000',
              name: getNativeTokenName(chain),
              symbol: getNativeTokenSymbol(chain),
              decimals: 18,
              balance: nativeData.balance,
              balance_formatted: (parseFloat(nativeData.balance) / Math.pow(10, 18)).toFixed(6),
              usd_price: 0,
              usd_value: 0,
              portfolio_percentage: 0
            };
          }
        }
      } catch (nativeError) {
        console.error('Error fetching native balance:', nativeError);
      }

      // Process and format tokens
      const processedTokens: TokenBalance[] = [];
      let totalValue = 0;

      // Add native token if exists
      if (nativeBalance) {
        processedTokens.push(nativeBalance);
      }

      // Add ERC20 tokens
      for (const token of tokens) {
        if (token.balance && parseFloat(token.balance_formatted) > 0) {
          const usdValue = (token.usd_price || 0) * parseFloat(token.balance_formatted);
          totalValue += usdValue;

          processedTokens.push({
            token_address: token.token_address,
            name: token.name || 'Unknown Token',
            symbol: token.symbol || '???',
            logo: token.logo,
            thumbnail: token.thumbnail,
            decimals: token.decimals || 18,
            balance: token.balance,
            balance_formatted: token.balance_formatted,
            usd_price: token.usd_price || 0,
            usd_value: usdValue,
            portfolio_percentage: 0 // Will calculate after we have total
          });
        }
      }

      // Calculate portfolio percentages
      if (totalValue > 0) {
        processedTokens.forEach(token => {
          token.portfolio_percentage = ((token.usd_value || 0) / totalValue) * 100;
        });
      }

      // Sort by USD value (descending)
      processedTokens.sort((a, b) => (b.usd_value || 0) - (a.usd_value || 0));

      const portfolio: WalletPortfolio = {
        address: address.toLowerCase(),
        chain: chain.toLowerCase(),
        totalValueUSD: totalValue,
        tokenCount: processedTokens.length,
        tokens: processedTokens,
        lastUpdated: new Date().toISOString()
      };

      // Format for display
      const formattedTokens = processedTokens.slice(0, 10).map(token => {
        const valueFormatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(token.usd_value || 0);

        return {
          ...token,
          value_formatted: valueFormatted,
          percentage_formatted: `${(token.portfolio_percentage || 0).toFixed(1)}%`
        };
      });

      const totalFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(totalValue);

      return NextResponse.json({
        ok: true,
        portfolio: {
          ...portfolio,
          tokens: formattedTokens,
          total_formatted: totalFormatted
        }
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' // Cache 30 detik
        }
      });

    } catch (apiError) {
      console.error('Moralis API error:', apiError);
      return NextResponse.json({
        ok: false,
        code: "API_ERROR",
        message: "Gagal mengambil data portofolio dari blockchain"
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Error in portfolio API:', error);
    return NextResponse.json({
      ok: false,
      code: "INTERNAL_ERROR",
      message: "Terjadi kesalahan sistem"
    }, { status: 500 });
  }
}

function getNativeTokenName(chain: string): string {
  const names: Record<string, string> = {
    'eth': 'Ethereum',
    'bsc': 'BNB Smart Chain',
    'polygon': 'Polygon',
    'avalanche': 'Avalanche',
    'fantom': 'Fantom',
    'arbitrum': 'Arbitrum',
    'optimism': 'Optimism'
  };
  return names[chain.toLowerCase()] || 'Native Token';
}

function getNativeTokenSymbol(chain: string): string {
  const symbols: Record<string, string> = {
    'eth': 'ETH',
    'bsc': 'BNB',
    'polygon': 'MATIC',
    'avalanche': 'AVAX',
    'fantom': 'FTM',
    'arbitrum': 'ETH',
    'optimism': 'ETH'
  };
  return symbols[chain.toLowerCase()] || 'NATIVE';
}
