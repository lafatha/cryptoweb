"use client"

import { useState } from "react"
import Link from "next/link"
import { useAccount, useDisconnect } from "wagmi"
import { Menu, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { WalletConnectModal } from "@/components/WalletConnectModal"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/news", label: "News" },
]

// Minimal Logo Component
const Logo = () => (
  <div className="flex items-center space-x-2">
    <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
      <span className="text-white dark:text-black font-bold text-sm">CF</span>
    </div>
    <span className="text-xl font-bold text-black dark:text-white">CryptoFinance</span>
  </div>
)

export function Navbar() {
  const { isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [showWalletModal, setShowWalletModal] = useState(false)

  const handleDisconnect = () => {
    if (isConnected) {
      disconnect()
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo + Brand */}
        <Link href="/" className="flex items-center space-x-2">
          <Logo />
        </Link>

        {/* Center: Navigation Menu */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: User Menu & Theme Toggle */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <ModeToggle />
          </div>
          
          {/* User Authentication */}
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">Wallet Connected</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                <DropdownMenuItem asChild className="hover:bg-gray-100 dark:hover:bg-gray-900">
                  <Link href="/portfolio" className="cursor-pointer">Portfolio</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-gray-100 dark:hover:bg-gray-900">
                  <Link href="/dashboard/advisor" className="cursor-pointer">AI Advisor</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
                <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900">
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={() => setShowWalletModal(true)}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-2xl px-6 border-none"
            >
              Connect Wallet
            </Button>
          )}
          
          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="border-gray-300 dark:border-gray-600">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
              <div className="mb-6">
                <Logo />
              </div>
              
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {item.label}
                  </Link>
                ))}
                
                {isConnected && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-800 my-4" />
                    <Link 
                      href="/dashboard/portfolio" 
                      className="text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Portfolio
                    </Link>
                    <Link 
                      href="/dashboard/advisor" 
                      className="text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      AI Advisor
                    </Link>
                    <button 
                      onClick={() => disconnect()}
                      className="text-sm font-medium transition-colors hover:text-primary py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                    >
                      <LogOut className="h-4 w-4 mr-2 inline" />
                      Disconnect
                    </button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onEmailClick={() => {
          setShowWalletModal(false)
          window.location.href = '/auth/signin'
        }}
      />
    </header>
  )
}
