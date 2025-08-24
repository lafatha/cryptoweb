# CryptoFinance - Professional Crypto Trading Platform

A modern, professional cryptocurrency trading platform built with Next.js 14, featuring real-time market data, seamless wallet integration, and AI-powered financial advice.

## 🚀 Features

### 💰 Market & Trading
- **Real-time Market Data** - Live cryptocurrency prices via CoinGecko API
- **Professional Charts** - Interactive price charts with technical indicators
- **Market Analysis** - Comprehensive market insights and trends
- **Multi-asset Support** - 100+ cryptocurrencies with detailed data

### 🔗 Wallet Integration
- **MetaMask Support** - Seamless browser wallet connection
- **Multi-chain Support** - Ethereum, Polygon, and BSC networks
- **Smart Connect Logic** - Dynamic UI based on wallet connection status
- **Secure Authentication** - Wallet-based and email authentication

### 📊 Portfolio Management
- **Multi-wallet Tracking** - Connect multiple wallet addresses
- **Real-time Balances** - Live portfolio valuation across chains
- **Performance Analytics** - Detailed portfolio metrics and insights
- **Asset Allocation** - Visual breakdown of holdings

### 🤖 AI Financial Advisor
- **Chat Interface** - Interactive AI-powered investment advice
- **Portfolio Analysis** - Personalized recommendations based on holdings
- **Market Insights** - Real-time analysis and trading signals
- **Risk Assessment** - Smart risk management suggestions

### 🎨 User Experience
- **Professional UI** - Bloomberg-inspired minimalistic design
- **Dark/Light Mode** - Seamless theme switching
- **Responsive Design** - Optimized for desktop and mobile
- **Clean Navigation** - Intuitive user interface without distractions

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

### Blockchain & Wallet
- **Wallet Integration**: wagmi v2 + viem
- **Web3 Provider**: WalletConnect v2
- **Multi-chain**: Ethereum, Polygon, BSC
- **Type Safety**: TypeScript throughout

### Backend & Auth
- **Authentication**: NextAuth.js
- **API**: RESTful endpoints
- **Data Source**: CoinGecko API
- **State Management**: TanStack Query

## 📋 Prerequisites

- **Node.js** 18+ 
- **Package Manager** npm or yarn or pnpm
- **WalletConnect Project ID** (free at [walletconnect.com](https://walletconnect.com))
- **MetaMask** or compatible Web3 wallet

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/username/cryptoweb.git
cd cryptoweb
npm install
```

### 2. Environment Setup
Create `.env.local` in the root directory:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

### 3. Development Server
```bash
npm run dev
```

### 4. Open Application
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication & Wallet Connection

### Wallet Connection Flow
1. **Home Page**: Click "Connect" button
2. **Wallet Selection**: Choose MetaMask, WalletConnect, or Coinbase
3. **Authorization**: Approve connection in your wallet
4. **Connected State**: Wallet address appears in navbar
5. **Management**: Access portfolio, disconnect, switch networks

### Demo Account
For testing email authentication:
- **Email**: `demo@cryptofinance.app`
- **Password**: `demo123!`

### Supported Wallets
- ✅ **MetaMask** - Browser extension wallet
- 🔜 **WalletConnect** - Mobile and desktop wallets (coming soon)
- 🔜 **Coinbase Wallet** - Coinbase's native wallet (coming soon)

## 📱 Application Sections

### 🏠 Home
- Hero section with platform overview
- Real-time market ticker
- Quick access to trading features
- Professional landing experience

### 📈 Markets
- Live cryptocurrency prices
- Sortable data tables
- Search functionality
- Price change indicators
- Market cap and volume data

### 📊 Portfolio (Protected)
- **Authentication Required**: Wallet or email login
- Multi-wallet address tracking
- Real-time balance calculations
- Portfolio performance charts
- Asset allocation breakdowns

### 🤖 AI Advisor (Protected)
- **Authentication Required**: Wallet or email login
- Interactive chat interface
- Portfolio-aware recommendations
- Market analysis and insights
- Investment strategy suggestions

### 📰 News
- Curated cryptocurrency news
- Clean, Bloomberg-style layout
- Regular content updates
- Industry insights and analysis

## 🏗 Project Structure

```
cryptoweb/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # NextAuth endpoints
│   │   │   ├── news/       # News API
│   │   │   └── wallet-login/ # Wallet auth
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Protected dashboard
│   │   ├── markets/        # Market data pages
│   │   └── news/           # News section
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── MetaMaskBtn.tsx # Wallet connection
│   │   ├── WalletButton.tsx # Wallet management
│   │   ├── navbar.tsx     # Navigation
│   │   └── ...            # Other components
│   ├── lib/               # Utility libraries
│   │   ├── auth.ts        # NextAuth config
│   │   ├── wagmi.ts       # Wallet config
│   │   ├── coingecko.ts   # API client
│   │   └── utils.ts       # Utilities
│   └── hooks/             # Custom hooks
│       └── use-crypto-data.ts
├── public/                # Static assets
├── docs/                  # Documentation files
└── package.json          # Dependencies
```

## 🔧 Configuration

### WalletConnect Setup
1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create new project
3. Copy Project ID
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

### CoinGecko API (Optional)
For production with higher rate limits:
```env
COINGECKO_API_KEY=your_api_key
```

### NextAuth Configuration
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-32-character-secret-key
```

## 📊 API Reference

### Market Data
- `GET /api/markets` - Cryptocurrency market data
- `GET /api/charts/[id]` - Price chart data for specific crypto

### Authentication
- `GET|POST /api/auth/[...nextauth]` - NextAuth.js endpoints
- `POST /api/wallet-login` - Wallet-based authentication

### News & Content
- `GET /api/news` - Cryptocurrency news feed
- `GET /api/insights` - Market insights and analysis

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables in dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
COINGECKO_API_KEY=your_api_key (optional)
```

### Alternative Platforms
- **Netlify** - Static site generation
- **Railway** - Full-stack deployment  
- **AWS Amplify** - AWS ecosystem
- **DigitalOcean** - App Platform

## 🧪 Development

### Add UI Components
```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```

### Code Quality
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks (optional)

## 🔒 Security & Best Practices

### Wallet Security
- ✅ Secure wallet connection protocols
- ✅ No private key handling in frontend
- ✅ Read-only wallet operations for portfolio tracking
- ⚠️ Always verify smart contract interactions

### API Security
- ✅ CORS configuration
- ✅ Rate limiting (recommended for production)
- ✅ Input validation
- ✅ Secure environment variables

### Authentication
- ✅ NextAuth.js secure session management
- ✅ JWT tokens with expiration
- ✅ Protected route middleware
- ✅ Wallet signature verification

## 🚨 Important Disclaimers

- **Educational Purpose**: This is a demo application for learning
- **Not Financial Advice**: All information is for educational purposes only
- **Trade Responsibly**: Cryptocurrency trading involves significant risk
- **Audit Smart Contracts**: Always verify contract addresses and code
- **Secure Your Wallet**: Keep private keys and seed phrases safe

## 🤝 Contributing

### Getting Started
1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a feature branch
4. Make your changes with tests
5. Submit a pull request with clear description

### Contribution Guidelines
- Follow TypeScript best practices
- Use existing UI components when possible
- Add proper error handling
- Include relevant documentation
- Test wallet connections thoroughly

### Development Workflow
```bash
git checkout -b feature/your-feature-name
# Make your changes
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
# Create pull request on GitHub
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📞 Support & Community

### Get Help
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/username/cryptoweb/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/username/cryptoweb/discussions)
- 📖 **Documentation**: Check `/docs` folder for detailed guides
- 💬 **Community**: Join our Discord server

### Roadmap
- [ ] Advanced trading features
- [ ] More wallet integrations
- [ ] Mobile application
- [ ] DeFi protocol integrations
- [ ] Advanced charting tools

---

**Built with ❤️ using Next.js, TypeScript, and modern Web3 technologies.**

*Professional crypto trading platform for the modern investor.*