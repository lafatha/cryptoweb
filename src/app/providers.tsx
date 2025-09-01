'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { PortfolioProvider } from '@/contexts/portfolio-context'
import { config } from '@/lib/wagmi'

// Simplified QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1000,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

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
