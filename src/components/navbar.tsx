"use client"

import { useState } from 'react'
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Menu, TrendingUp, LogIn, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { WalletButton } from "@/components/WalletButton"
import { WalletConnectModal } from "@/components/WalletConnectModal"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/markets", label: "Markets" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" },
]

export function Navbar() {
  const { data: session, status } = useSession()
  const [showWalletModal, setShowWalletModal] = useState(false)

  return (
    <>
      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onEmailClick={() => {
          setShowWalletModal(false)
          // Navigate to email sign in
          window.location.href = '/auth/signin'
        }}
      />
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6" />
          <span className="font-bold text-xl">CryptoFinance</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side - Auth, Wallet, Theme toggle and mobile menu */}
        <div className="flex items-center space-x-2">
          {/* Wallet Button */}
          <WalletButton onConnect={() => setShowWalletModal(true)} />
          
          {/* Authentication */}
          {status === "loading" ? (
            <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{session.user?.name || session.user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/portfolio">Portfolio</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/advisor">AI Advisor</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setShowWalletModal(true)} size="sm">
              <LogIn className="h-4 w-4 mr-2" />
              Connect
            </Button>
          )}

          <ModeToggle />
          
          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
                {session && (
                  <>
                    <hr className="my-4" />
                    <Link href="/dashboard/portfolio" className="text-sm font-medium transition-colors hover:text-primary">
                      Portfolio
                    </Link>
                    <Link href="/dashboard/advisor" className="text-sm font-medium transition-colors hover:text-primary">
                      AI Advisor
                    </Link>
                    <button 
                      onClick={() => signOut()}
                      className="text-sm font-medium transition-colors hover:text-primary text-left"
                    >
                      Sign Out
                    </button>
                  </>
                )}
                {!session && (
                  <Link href="/auth/signin" className="text-sm font-medium transition-colors hover:text-primary">
                    Sign In
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    </>
  )
}
