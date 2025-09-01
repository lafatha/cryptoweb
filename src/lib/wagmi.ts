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
    injected(), // Simplified injected connector for better compatibility
    // Only add WalletConnect if projectId is available
    ...(projectId && projectId !== 'demo-project-id' ? [
      walletConnect({
        projectId,
        metadata: {
          name: 'CryptoFinance',
          description: 'Professional Crypto Trading Platform',
          url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
          icons: []
        },
        showQrModal: false,
      })
    ] : []),
    // Only add Coinbase if projectId is available
    ...(projectId && projectId !== 'demo-project-id' ? [
      coinbaseWallet({
        appName: 'CryptoFinance',
        preference: 'smartWalletOnly'
      })
    ] : [])
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

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
