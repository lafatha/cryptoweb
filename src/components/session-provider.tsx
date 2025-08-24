"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export function SessionProvider({
  children,
  ...props
}: {
  children: React.ReactNode
}) {
  return (
    <NextAuthSessionProvider {...props}>
      {children}
    </NextAuthSessionProvider>
  )
}
