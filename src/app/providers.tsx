'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import { config } from '@/lib/wagmi'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            defaultTheme="system"
            storageKey="crypto-finance-theme"
          >
            {children}
            <Toaster 
              position="bottom-right"
              expand={false}
              richColors
              closeButton={false}
              duration={3000}
              toastOptions={{
                style: {
                  background: 'rgba(30, 30, 30, 0.95)',
                  border: '1px solid #222',
                  color: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                  padding: '16px',
                  fontSize: '15px',
                  fontWeight: '500',
                  minWidth: '280px',
                  maxWidth: '350px',
                },
              }}
            />
          </ThemeProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  )
}
