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
    injected({
      target: 'metaMask',
    }),
    // Disable WalletConnect temporarily to fix connection issues
    ...(projectId && projectId !== 'demo-project-id' ? [
      walletConnect({
        projectId,
        metadata: {
          name: 'CryptoFinance',
          description: 'Professional Crypto Trading Platform',
          url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
          icons: []
        },
        showQrModal: false, // Disable QR modal to prevent subscription issues
      })
    ] : []),
    ...(projectId && projectId !== 'demo-project-id' ? [
      coinbaseWallet({
        appName: 'CryptoFinance',
        appLogoUrl: undefined, // Remove logo URL to prevent loading issues
        preference: 'smartWalletOnly'
      })
    ] : [])
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
  // Disable persistence to force clean state on disconnect
  storage: null,
  // Add polyfill config to prevent EventEmitter issues
  ssr: false,
  syncConnectedChain: false,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
