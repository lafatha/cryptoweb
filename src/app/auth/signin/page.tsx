"use client"

import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { WalletConnectBtn } from "@/components/WalletConnectBtn"
import { MetaMaskBtn } from "@/components/MetaMaskBtn"

export default function SignInPage() {
  const { isConnected } = useAccount()
  const router = useRouter()

  // Redirect if already connected
  if (isConnected) {
    router.push("/portfolio")
    return null
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center mr-3">
              <span className="text-white dark:text-black font-bold text-lg">CF</span>
            </div>
            <span className="text-3xl font-black text-black dark:text-white">CryptoFinance</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-black dark:text-white leading-tight mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light">
            Access your portfolio with your crypto wallet
          </p>
        </div>

        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black rounded-2xl shadow-lg">
          <CardContent className="p-8 space-y-6">
            {/* Primary Wallet Options */}
            <div className="space-y-4">
              <MetaMaskBtn />
              <WalletConnectBtn />
            </div>

            {/* Alternative Options */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                Or continue without wallet
              </p>
              
              <Link href="/portfolio">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-2xl py-6"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Continue as Guest
                </Button>
              </Link>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                By connecting a wallet, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
