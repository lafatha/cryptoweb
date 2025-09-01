'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { PortfolioProvider } from '@/contexts/portfolio-context'
import { config } from '@/lib/wagmi'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          defaultTheme="system"
          storageKey="crypto-finance-theme"
        >
          <PortfolioProvider>
            {children}
          </PortfolioProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
