import { http, createConfig } from 'wagmi'
import { mainnet, polygon, bsc } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set')
}

export const config = createConfig({
  chains: [mainnet, polygon, bsc],
  connectors: [
    injected(),
    walletConnect({
      projectId: projectId || 'demo-project-id',
      metadata: {
        name: 'CryptoFinance',
        description: 'Professional Crypto Trading Platform',
        url: 'https://cryptofinance.app',
        icons: ['https://cryptofinance.app/logo.png']
      }
    }),
    coinbaseWallet({
      appName: 'CryptoFinance',
      appLogoUrl: 'https://cryptofinance.app/logo.png'
    })
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
