import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
// import EmailProvider from "next-auth/providers/email"

const authConfig = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Demo user for testing
        if (
          credentials.email === "demo@cryptofinance.app" &&
          credentials.password === "demo123!"
        ) {
          return {
            id: "demo-user",
            email: "demo@cryptofinance.app",
            name: "Demo User",
            walletAddress: null,
          }
        }

        // Allow any valid email/password for demo
        if (credentials.password.length >= 6) {
          return {
            id: `user-${Date.now()}`,
            email: credentials.email,
            name: credentials.email.split('@')[0],
            walletAddress: null,
          }
        }

        return null
      }
    }),
    CredentialsProvider({
      id: "wallet",
      name: "Wallet",
      credentials: {
        address: { label: "Address", type: "text" },
        signature: { label: "Signature", type: "text" },
        message: { label: "Message", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.signature) {
          return null
        }

        // In production, verify the signature here
        // For demo, just validate address format
        if (credentials.address.match(/^0x[a-fA-F0-9]{40}$/)) {
          return {
            id: `wallet-${credentials.address}`,
            email: `${credentials.address}@wallet.local`,
            name: `${credentials.address.slice(0, 6)}...${credentials.address.slice(-4)}`,
            walletAddress: credentials.address,
          }
        }

        return null
      }
    })
    // Uncomment for email provider
    // EmailProvider({
    //   server: {
    //     host: process.env.EMAIL_SERVER_HOST,
    //     port: process.env.EMAIL_SERVER_PORT,
    //     auth: {
    //       user: process.env.EMAIL_SERVER_USER,
    //       pass: process.env.EMAIL_SERVER_PASSWORD,
    //     },
    //   },
    //   from: process.env.EMAIL_FROM,
    // })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      if (user) {
        token.id = user.id
        token.walletAddress = user.walletAddress
      }
      if (account?.provider === "wallet") {
        token.isWallet = true
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      // Always return a valid session object
      if (!session.user) session.user = {};
      session.user.id = token?.id || null;
      session.user.walletAddress = token?.walletAddress || null;
      session.user.isWallet = token?.isWallet || false;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig)

export { handlers as GET, handlers as POST }
