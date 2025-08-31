# Manual Wallet Portfolio Feature

This feature allows users to view portfolio data for any wallet address or ENS name without connecting their own wallet.

## Setup

1. Add your Moralis API key to `.env.local`:
   ```
   MORALIS_API_KEY=your_moralis_api_key_here
   ```

2. Get a free Moralis API key from [Moralis.io](https://moralis.io/)

## Features

### UI Components
- **ManualAddressInput**: Input component for wallet addresses/ENS
- Toggle between wallet connection and manual input
- Support for multiple chains (ETH, BSC, Polygon, Arbitrum, Optimism, Base)
- Local storage for last used addresses
- Validation and error handling
- Example addresses for testing

### API Routes
- **`/api/wallet/resolve`**: Resolves ENS names to addresses
- **`/api/wallet/holdings`**: Fetches portfolio data via Moralis
- **`/api/coingecko/token-prices`**: Gets token prices for multi-chain support

### Functionality
- Fetches native balances and ERC20 tokens via Moralis API
- Gets pricing data from CoinGecko for accurate USD values
- Normalizes data to match existing UI format
- Caching and rate limiting for performance
- Works with AI agent for portfolio analysis

### Security
- All API calls go through server-side routes
- API keys are never exposed to client
- Input validation and sanitization
- Rate limiting per IP address

## Usage

1. On the portfolio page, if not connected to MetaMask, you'll see "Use Address Instead"
2. Enter any wallet address (0x...) or ENS name (.eth)
3. Select the blockchain network
4. Click "Load Portfolio" to fetch holdings
5. Portfolio data integrates with existing charts and AI agent

## Error Handling

- Invalid address/ENS: "Invalid wallet address or ENS name"
- ENS not found: "ENS name not found"
- Rate limiting: "Too many requests. Please wait a moment."
- Service errors: "Service temporarily unavailable"

## Caching

- Client-side: 20 seconds in-memory cache
- Server-side: 30 seconds CDN cache
- LocalStorage: Last used address for quick reload

## Supported Chains

- Ethereum (eth)
- Binance Smart Chain (bsc)
- Polygon (polygon)
- Arbitrum (arbitrum)
- Optimism (optimism)
- Base (base)

More chains can be easily added by updating the `CHAINS` configuration in `/lib/chain.ts`.
