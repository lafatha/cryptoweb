export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  context?: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const { GROQ_API_KEY } = process.env;

    if (!GROQ_API_KEY) {
      return Response.json({
        ok: false,
        code: "NO_API_KEY",
        message: "AI chat service not configured"
      });
    }

    // Parse request body
    let body: ChatRequest;
    try {
      body = await request.json();
    } catch {
      return Response.json({
        ok: false,
        code: "BAD_REQUEST",
        message: "Invalid JSON in request body"
      });
    }

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json({
        ok: false,
        code: "BAD_REQUEST", 
        message: "Messages array is required"
      });
    }

    const lastUserMessage = body.messages[body.messages.length - 1];
    const userQuery = lastUserMessage?.content || '';
    
    // Detect language
    const queryLanguage = detectLanguage(userQuery);

    // 1. HARGA & DATA COIN (CoinGecko Public API)
    if (isPriceQuery(userQuery)) {
      const coinSymbols = extractCoinSymbols(userQuery);
      if (coinSymbols.length > 0) {
        const priceResponse = await handlePriceQuery(coinSymbols, queryLanguage);
        if (priceResponse) {
          return Response.json({
            ok: true,
            content: priceResponse
          });
        }
      }
    }

    // 2. BERITA CRYPTO (CryptoPanic API)
    if (isNewsQuery(userQuery)) {
      const newsResponse = await handleNewsQuery(userQuery, queryLanguage);
      if (newsResponse) {
        return Response.json({
          ok: true,
          content: newsResponse
        });
      }
    }

    // 3. PORTOFOLIO USER (Session-based)
    if (isPortfolioQuery(userQuery)) {
      const portfolioResponse = await handlePortfolioQuery(userQuery, request.headers, queryLanguage);
      if (portfolioResponse) {
        return Response.json({
          ok: true,
          content: portfolioResponse
        });
      }
    }

    // Default AI chat response untuk query lainnya
    const systemPrompt = `Kamu adalah asisten crypto yang cerdas dan informatif.

**KONTEKS SESI:**
- Jika session.wallet_address tersedia, selalu gunakan itu untuk pertanyaan seperti: "portofolio saya", "saldo saya", "aset saya", tanpa meminta alamat lagi
- Jika tidak ada session.wallet_address, barulah minta user menghubungkan wallet

**AKSI PORTOFOLIO:**
- Panggil fungsi getPortfolio() (tanpa argumen) yang membaca session.wallet_address di server
- Tampilkan: Total nilai USD, Perubahan 24h (%), Tabel: Symbol | Qty | Price USD | Value USD | % dari total
- Jangan beri saran investasi; jawab ringkas, jelas, tidak terpotong

**KESALAHAN:**
- Jika blockchain data gagal: "Maaf, portofolio tidak bisa diambil saat ini"
- Jika wallet tidak terhubung: "Hubungkan wallet Anda terlebih dahulu"

**ATURAN UMUM:**
1. JANGAN BERI SARAN INVESTASI - Hanya tampilkan data objektif
2. Gunakan bahasa yang jelas dan rapi
3. Prioritaskan data dari blockchain, jangan mengarang angka
4. Humor ringan boleh, tapi jangan ganggu kejelasan angka
5. JANGAN sebutkan nama penyedia data eksternal

Format jawaban dengan markdown dan emoji untuk readability.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...body.messages
    ];

    if (body.context) {
      const contextMessage = `Konteks tambahan: ${JSON.stringify(body.context)}`;
      messages.splice(-1, 0, { role: 'system', content: contextMessage });
    }

    // Try SSE streaming first
    try {
      const streamResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 1000
          })
        }
      );

      // If streaming succeeds, proxy the SSE response
      if (streamResponse.body) {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const readableStream = new ReadableStream({
          async start(controller) {
            const reader = streamResponse.body!.getReader();
            
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    
                    if (data === '[DONE]') {
                      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                      controller.close();
                      return;
                    }

                    try {
                      const parsed = JSON.parse(data);
                      const content = parsed.choices?.[0]?.delta?.content;
                      
                      if (content) {
                        const sseData = JSON.stringify({ content });
                        controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
                      }
                    } catch {
                      // Skip invalid JSON chunks
                      continue;
                    }
                  }
                }
              }
            } catch (error) {
              console.error('SSE streaming error:', error);
              // Send error message instead of calling controller.error
              const errorMsg = JSON.stringify({ error: 'Connection interrupted. Please try again.' });
              controller.enqueue(encoder.encode(`data: ${errorMsg}\n\n`));
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
              controller.close();
            } finally {
              reader.releaseLock();
            }
          }
        });

        return new Response(readableStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          }
        });
      }
    } catch (streamError) {
      console.log('SSE streaming failed, falling back to JSON:', streamError);
      // Continue to JSON fallback below
    }

    // JSON Fallback: Non-streaming request
    try {
      const jsonResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            stream: false,
            temperature: 0.7,
            max_tokens: 1000
          })
        }
      );

      const data = await jsonResponse.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return Response.json({
          ok: false,
          code: "NO_RESPONSE",
          message: "Tidak ada respons dari AI"
        });
      }

      return Response.json({
        ok: true,
        content: content
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

    } catch (jsonError) {
      return Response.json({
        ok: false,
        code: "LLM_ERROR",
        message: "Failed to get AI response"
      });
    }

  } catch (error) {
    return Response.json({
      ok: false,
      code: "INTERNAL_ERROR",
      message: "Internal server error"
    });
  }
}

// Helper functions untuk mendeteksi jenis query
function detectLanguage(message: string): 'id' | 'en' {
  const indonesianWords = ['harga', 'berita', 'portofolio', 'saya', 'berapa', 'sekarang', 'saldo', 'aset', 'token', 'crypto', 'bitcoin', 'ethereum'];
  const englishWords = ['price', 'news', 'portfolio', 'my', 'how much', 'now', 'balance', 'assets', 'token', 'crypto', 'bitcoin', 'ethereum'];
  
  const lowerMessage = message.toLowerCase();
  let indonesianCount = 0;
  let englishCount = 0;
  
  indonesianWords.forEach(word => {
    if (lowerMessage.includes(word)) indonesianCount++;
  });
  
  englishWords.forEach(word => {
    if (lowerMessage.includes(word)) englishCount++;
  });
  
  return indonesianCount >= englishCount ? 'id' : 'en';
}

function isPriceQuery(message: string): boolean {
  const priceKeywords = [
    'harga', 'price', 'berapa', 'how much', 'current price', 'sekarang',
    'nilai', 'worth', 'cost', 'trade', 'trading'
  ];
  const lowerMessage = message.toLowerCase();
  return priceKeywords.some(keyword => lowerMessage.includes(keyword));
}

function isNewsQuery(message: string): boolean {
  const newsKeywords = [
    'berita', 'news', 'update', 'kabar', 'informasi', 'perkembangan',
    'terbaru', 'latest', 'recent', 'apa ada', 'ada apa'
  ];
  const lowerMessage = message.toLowerCase();
  return newsKeywords.some(keyword => lowerMessage.includes(keyword));
}

function isPortfolioQuery(message: string): boolean {
  const portfolioKeywords = [
    'portofolio', 'portfolio', 'saldo', 'balance', 'aset', 'assets',
    'wallet', 'dompet', 'kepemilikan', 'token saya', 'coin saya'
  ];
  const lowerMessage = message.toLowerCase();
  return portfolioKeywords.some(keyword => lowerMessage.includes(keyword));
}

function extractCoinSymbols(message: string): string[] {
  const commonCoins = [
    'btc', 'eth', 'ada', 'xrp', 'sol', 'matic', 'avax', 'dot', 'link', 'uni',
    'bnb', 'usdt', 'usdc', 'luna', 'atom', 'algo', 'vet', 'icp', 'fil', 'trx',
    'etc', 'xmr', 'doge', 'shib', 'cake', 'sushi', 'comp', 'aave', 'mkr', 'yfi',
    'ena', 'pepe', 'wif', 'bonk', 'floki', 'arb', 'op', 'matic', 'polygon'
  ];
  const symbols: string[] = [];
  const lowerMessage = message.toLowerCase();
  
  commonCoins.forEach(coin => {
    if (lowerMessage.includes(coin)) {
      symbols.push(coin);
    }
  });
  
  return symbols;
}

async function handlePriceQuery(symbols: string[], language: 'id' | 'en' = 'id'): Promise<string | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const symbolsParam = symbols.join(',');
    
    const response = await fetch(
      `${baseUrl}/api/coingecko/prices?symbols=${symbolsParam}`,
      { 
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      }
    );
    
    if (!response.ok) {
      return language === 'id' ? "Data tidak dapat diambil saat ini." : "Data cannot be retrieved at this time.";
    }
    
    const data = await response.json();
    
    if (data.ok && data.coins && data.coins.length > 0) {
      // Format sesuai ketentuan persis
      const responses = data.coins.map((coin: any) => {
        const price = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: coin.current_price < 1 ? 4 : 2,
          maximumFractionDigits: coin.current_price < 1 ? 8 : 2,
        }).format(coin.current_price);

        const marketCap = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: 'compact',
        }).format(coin.market_cap);

        const change24h = coin.price_change_24h >= 0 ? 
          `+${coin.price_change_24h.toFixed(1)}%` :
          `${coin.price_change_24h.toFixed(1)}%`;

        if (language === 'id') {
          return `Harga ${coin.name} (${coin.symbol}) saat ini sekitar ${price} (24h: ${change24h}, market cap: ${marketCap}).`;
        } else {
          return `The price of ${coin.name} (${coin.symbol}) is currently around ${price} (24h: ${change24h}, market cap: ${marketCap}).`;
        }
      });

      return responses.join('\n\n');
    }
    
    return language === 'id' ? "Data tidak dapat diambil saat ini." : "Data cannot be retrieved at this time.";
  } catch (error) {
    console.error('Error in handlePriceQuery:', error);
    return language === 'id' ? "Data tidak dapat diambil saat ini." : "Data cannot be retrieved at this time.";
  }
}

async function handleNewsQuery(query: string, language: 'id' | 'en' = 'id'): Promise<string | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Extract symbol from query if possible
    const symbol = extractCoinSymbols(query)[0] || 'BTC';
    
    const response = await fetch(
      `${baseUrl}/api/news/crypto?symbol=${symbol}&limit=5`,
      { 
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      }
    );
    
    if (!response.ok) {
      return language === 'id' ? "Data tidak dapat diambil saat ini." : "Data cannot be retrieved at this time.";
    }
    
    const data = await response.json();
    
    if (data.ok && data.news && data.news.length > 0) {
      let result = language === 'id' 
        ? `**Berita terbaru ${symbol.toUpperCase()}:**\n\n`
        : `**Latest ${symbol.toUpperCase()} news:**\n\n`;
      
      data.news.slice(0, 5).forEach((news: any, index: number) => {
        result += `- ${news.title} (${news.url})\n`;
      });
      
      return result;
    }
    
    return language === 'id' ? "Tidak ada berita tersedia saat ini." : "No news available at this time.";
  } catch (error) {
    console.error('Error in handleNewsQuery:', error);
    return language === 'id' ? "Data tidak dapat diambil saat ini." : "Data cannot be retrieved at this time.";
  }
}

async function handlePortfolioQuery(userQuery: string, headers?: Headers, language: 'id' | 'en' = 'id'): Promise<string | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Detect if query contains wallet address
    const addressRegex = /0x[a-fA-F0-9]{40}/;
    const addressMatch = userQuery.match(addressRegex);
    
    let walletAddress: string | null = null;
    let isUserPortfolio = false;
    
    if (addressMatch) {
      walletAddress = addressMatch[0];
    } else {
      // User's portfolio - get from session or headers
      isUserPortfolio = true;
      // Try to get wallet address from headers (set by client from localStorage)
      walletAddress = headers?.get('x-wallet-address') || null;
    }
    
    let response: Response;
    
    if (isUserPortfolio && walletAddress) {
      // User's portfolio with wallet address from headers
      response = await fetch(
        `${baseUrl}/api/portfolio`,
        { 
          headers: { 
            'Accept': 'application/json',
            'Cookie': headers?.get('cookie') || '',
            'x-wallet-address': walletAddress
          },
          cache: 'no-store'
        }
      );
    } else if (isUserPortfolio && !walletAddress) {
      // User's portfolio from session only
      response = await fetch(
        `${baseUrl}/api/portfolio`,
        { 
          headers: { 
            'Accept': 'application/json',
            'Cookie': headers?.get('cookie') || ''
          },
          cache: 'no-store'
        }
      );
    } else {
      // Someone else's portfolio
      response = await fetch(
        `${baseUrl}/api/wallet/portfolio?address=${walletAddress}`,
        { 
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        }
      );
    }
    
    if (!response.ok) {
      if (isUserPortfolio) {
        if (language === 'id') {
          return `**📊 Portofolio Tidak Tersedia**

Untuk melihat portofolio Anda:
1. **Hubungkan wallet** di dashboard
2. **Login dengan MetaMask** atau wallet lainnya  
3. Sistem akan otomatis menyimpan alamat wallet Anda

Setelah terhubung, tanya:
- "portofolio saya"
- "saldo wallet saya" 
- "aset crypto saya"

*Tanpa perlu input alamat manual lagi*`;
        } else {
          return `**📊 Portfolio Not Available**

To view your portfolio:
1. **Connect wallet** in dashboard
2. **Login with MetaMask** or other wallet
3. System will automatically save your wallet address

Once connected, ask:
- "my portfolio"
- "my wallet balance"
- "my crypto assets"

*No need to manually enter address again*`;
        }
      } else {
        return language === 'id' 
          ? `Maaf, tidak dapat menemukan data portofolio untuk alamat ${walletAddress}.`
          : `Sorry, cannot find portfolio data for address ${walletAddress}.`;
      }
    }
    
    const data = await response.json();
    
    if (!data.ok || !data.portfolio) {
      return language === 'id' ? "Maaf, portofolio tidak bisa diambil saat ini." : "Sorry, portfolio cannot be retrieved at this time.";
    }
    
    const portfolio = data.portfolio;
    
    if (portfolio.tokenCount === 0) {
      if (isUserPortfolio) {
        return language === 'id'
          ? `**📭 Portofolio Kosong**

Wallet Anda terhubung tapi tidak ada token atau saldo ditemukan.

*Data real-time dari blockchain*`
          : `**📭 Empty Portfolio**

Your wallet is connected but no tokens or balance found.

*Real-time data from blockchain*`;
      } else {
        return language === 'id'
          ? `**📭 Portofolio Kosong**

Alamat ${walletAddress} tidak memiliki token atau saldo.

*Data real-time dari blockchain*`
          : `**📭 Empty Portfolio**

Address ${walletAddress} has no tokens or balance.

*Real-time data from blockchain*`;
      }
    }

    // Format output yang informatif
    let result = `**📊 ${isUserPortfolio ? (language === 'id' ? 'Portofolio Anda' : 'Your Portfolio') : `${language === 'id' ? 'Portofolio' : 'Portfolio'} ${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}`}**\n\n`;
    result += `💰 **${language === 'id' ? 'Total Nilai' : 'Total Value'}:** ${portfolio.total_formatted}\n`;
    result += `🪙 **${language === 'id' ? 'Jumlah Token' : 'Token Count'}:** ${portfolio.tokenCount}\n\n`;
    
    // Format as table
    result += `| ${language === 'id' ? 'Symbol' : 'Symbol'} | ${language === 'id' ? 'Qty' : 'Qty'} | ${language === 'id' ? 'Price USD' : 'Price USD'} | ${language === 'id' ? 'Value USD' : 'Value USD'} | ${language === 'id' ? '% dari total' : '% of total'} |\n`;
    result += `|--------|-----|-----------|-----------|-------------|\n`;
    
    portfolio.tokens.slice(0, 10).forEach((token: any) => {
      const qty = parseFloat(token.balance_formatted).toFixed(4);
      const price = token.usd_price ? `$${token.usd_price.toFixed(2)}` : '-';
      result += `| ${token.symbol} | ${qty} | ${price} | ${token.value_formatted} | ${token.percentage_formatted} |\n`;
    });
    
    if (portfolio.tokens.length > 10) {
      result += `\n*...${language === 'id' ? 'dan' : 'and'} ${portfolio.tokens.length - 10} ${language === 'id' ? 'token lainnya' : 'other tokens'}*`;
    }
    
    result += `\n\n*📡 ${language === 'id' ? 'Data real-time dari blockchain' : 'Real-time data from blockchain'}*`;
    
    // Add risk analysis for user's portfolio
    if (isUserPortfolio && portfolio.tokens && portfolio.tokens.length > 0) {
      result += `\n\n**🔍 ${language === 'id' ? 'Analisis Risiko Portofolio' : 'Portfolio Risk Analysis'}:**\n`;
      
      // Check for dominant token (>50%)
      const dominantToken = portfolio.tokens.find((token: any) => 
        parseFloat(token.percentage_formatted) > 50
      );
      
      if (dominantToken) {
        result += language === 'id' 
          ? `- Portofolio Anda sangat terpusat pada ${dominantToken.symbol}, ini bisa meningkatkan risiko.\n`
          : `- Your portfolio is heavily concentrated on ${dominantToken.symbol}, which could increase risk.\n`;
      }
      
      // Check for many small tokens (<1%)
      const smallTokens = portfolio.tokens.filter((token: any) => 
        parseFloat(token.percentage_formatted) < 1
      );
      
      if (smallTokens.length > 5) {
        result += language === 'id'
          ? `- Banyak aset kecil (${smallTokens.length} token <1%), sulit untuk dikelola.\n`
          : `- Many small assets (${smallTokens.length} tokens <1%), difficult to manage.\n`;
      }
      
      // Check distribution
      const top3Percentage = portfolio.tokens.slice(0, 3).reduce((sum: number, token: any) => 
        sum + parseFloat(token.percentage_formatted), 0
      );
      
      if (top3Percentage < 70) {
        result += language === 'id'
          ? `- Distribusi portofolio cukup sehat dengan diversifikasi yang baik.\n`
          : `- Portfolio distribution is quite healthy with good diversification.\n`;
      } else if (top3Percentage > 80) {
        result += language === 'id'
          ? `- Portofolio cukup terpusat pada beberapa aset utama.\n`
          : `- Portfolio is quite concentrated on a few main assets.\n`;
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('Error in handlePortfolioQuery:', error);
    return language === 'id' ? "Maaf, portofolio tidak bisa diambil saat ini." : "Sorry, portfolio cannot be retrieved at this time.";
  }
}
