"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Newspaper,
  DollarSign,
  Brain,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react"

const sidebarItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Markets",
    href: "/markets",
    icon: TrendingUp,
  },
  {
    title: "Portfolio",
    href: "/dashboard/portfolio",
    icon: PieChart,
  },
  {
    title: "AI Advisor",
    href: "/dashboard/advisor",
    icon: Brain,
  },
  {
    title: "News",
    href: "/news",
    icon: Newspaper,
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={cn("relative", className)}>
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex flex-col h-full border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}>
        {/* Collapse Toggle */}
        <div className="flex items-center justify-end p-2 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Sidebar Content */}
        <nav className="flex-1 p-2 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon" className="fixed top-20 left-4 z-40">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Dashboard</h2>
            </div>
            <nav className="flex-1 p-2 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
