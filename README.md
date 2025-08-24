# CryptoFinance - Professional Crypto Trading Platform

A modern, professional cryptocurrency trading platform built with Next.js 14, featuring real-time market data, wallet integration, and AI-powered financial advice.

## 🚀 Features

- **Real-time Market Data** - Live cryptocurrency prices via CoinGecko API
- **Wallet Integration** - Support for MetaMask, WalletConnect, and Coinbase Wallet
- **Authentication** - Email/password and wallet-based authentication
- **Portfolio Management** - Track holdings across multiple blockchains
- **AI Financial Advisor** - Chat-based crypto investment advice
- **Professional UI** - Bloomberg-inspired minimalistic design
- **Multi-chain Support** - Ethereum, Polygon, and BSC networks
- **News Feed** - Curated cryptocurrency news and insights

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: NextAuth.js
- **Wallet**: wagmi v2 + viem + WalletConnect v2
- **Charts**: Recharts
- **Animations**: Framer Motion
- **API**: CoinGecko for market data

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- A WalletConnect Project ID (free at [walletconnect.com](https://walletconnect.com))

## ⚡ Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crypto-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```bash
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication

### Demo Account
- **Email**: `demo@cryptofinance.app`
- **Password**: `demo123!`

### Wallet Authentication
Connect with any supported wallet:
- MetaMask
- WalletConnect (any WC-compatible wallet)
- Coinbase Wallet

## 📱 Usage

### Markets
- View real-time cryptocurrency prices
- Sort and search through 100+ cryptocurrencies
- Click on any asset for detailed charts

### Portfolio (Protected)
- Requires authentication (email or wallet)
- Add wallet addresses to track holdings
- View portfolio allocation and performance

### AI Advisor (Protected)
- Chat-based financial advice
- Portfolio-aware recommendations
- Market insights and analysis

### News
- Curated cryptocurrency news
- Bloomberg-style minimalistic layout
- Real-time updates

## 🏗 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard pages
│   └── markets/           # Market data pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── coingecko.ts      # CoinGecko API client
│   └── wagmi.ts          # Wallet configuration
└── hooks/                # Custom React hooks
```

## 🔧 Configuration

### WalletConnect Setup
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create a new project
3. Copy your Project ID
4. Add it to your `.env.local` file

### CoinGecko API (Optional)
For production with higher rate limits:
1. Get an API key from [CoinGecko](https://coingecko.com/api)
2. Add `COINGECKO_API_KEY=your_key` to `.env.local`

## 📊 API Routes

- `GET /api/news` - Fetch cryptocurrency news
- `POST /api/wallet-login` - Wallet authentication
- `GET|POST /api/auth/[...nextauth]` - NextAuth endpoints

## 🔄 Development

### Adding New Components
```bash
npx shadcn@latest add [component-name]
```

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
npm start
```

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## 🚨 Important Notes

- This is a demo application for educational purposes
- Not financial advice - trade at your own risk
- Wallet connections are secure but audit smart contracts
- API keys should be kept secure in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For questions or issues:
- Open a GitHub issue
- Check the documentation
- Join our Discord community

---

Built with ❤️ using Next.js and modern web technologies.