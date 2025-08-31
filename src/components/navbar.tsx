"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useAccount } from "wagmi"
import { Menu, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/news", label: "News" },
]

// Simple Robot SVG Icon Component
const RobotIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg 
    viewBox="0 0 32 32" 
    className={className}
    fill="currentColor"
  >
    {/* Robot Head */}
    <rect x="8" y="8" width="16" height="12" rx="2" className="fill-gray-700 dark:fill-gray-300" />
    
    {/* Robot Eyes */}
    <circle cx="12" cy="12" r="1.5" className="fill-white dark:fill-gray-900" />
    <circle cx="20" cy="12" r="1.5" className="fill-white dark:fill-gray-900" />
    
    {/* Robot Mouth */}
    <rect x="14" y="16" width="4" height="1" rx="0.5" className="fill-white dark:fill-gray-900" />
    
    {/* Robot Antenna */}
    <line x1="16" y1="8" x2="16" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="16" cy="4" r="1" className="fill-gray-700 dark:fill-gray-300" />
    
    {/* Robot Body */}
    <rect x="10" y="20" width="12" height="8" rx="1" className="fill-gray-600 dark:fill-gray-400" />
    
    {/* Robot Arms */}
    <rect x="6" y="22" width="4" height="2" rx="1" className="fill-gray-600 dark:fill-gray-400" />
    <rect x="22" y="22" width="4" height="2" rx="1" className="fill-gray-600 dark:fill-gray-400" />
  </svg>
)

export function Navbar() {
  const { data: session, status } = useSession()
  const { isConnected } = useAccount()

  return (
    <header className="sticky top-0 z-50 w-full border-b shadow-sm bg-white/70 dark:bg-gray-950/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60 transition-colors">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center px-4 lg:px-8">
        {/* Left: Logo + Brand */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <RobotIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
            <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              CryptoFinance
            </span>
          </Link>
        </div>

        {/* Center: Navigation Menu - Absolutely positioned to center */}
        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 transform md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: User Menu & Theme Toggle */}
        <div className="ml-auto flex items-center space-x-3">
          {/* User Authentication */}
          {status === "loading" ? (
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">{session.user?.name || session.user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/portfolio" className="cursor-pointer">Portfolio</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/advisor" className="cursor-pointer">AI Advisor</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {/* Theme Toggle */}
          <ModeToggle />
          
          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="ml-2">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex items-center space-x-3 mb-6">
                <RobotIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                <span className="font-bold text-lg">CryptoFinance</span>
              </div>
              
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium transition-colors hover:text-primary py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {item.label}
                  </Link>
                ))}
                
                {session && (
                  <>
                    <div className="border-t my-4" />
                    <Link 
                      href="/dashboard/portfolio" 
                      className="text-sm font-medium transition-colors hover:text-primary py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Portfolio
                    </Link>
                    <Link 
                      href="/dashboard/advisor" 
                      className="text-sm font-medium transition-colors hover:text-primary py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      AI Advisor
                    </Link>
                    <button 
                      onClick={() => signOut()}
                      className="text-sm font-medium transition-colors hover:text-primary py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                    >
                      <LogOut className="h-4 w-4 mr-2 inline" />
                      Sign Out
                    </button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
