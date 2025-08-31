"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionContextType {
  openItems: Set<string>
  toggleItem: (value: string) => void
  type: "single" | "multiple"
}

const AccordionContext = React.createContext<AccordionContextType | undefined>(undefined)

interface AccordionProps {
  type: "single" | "multiple"
  collapsible?: boolean
  className?: string
  children: React.ReactNode
}

const Accordion = ({ type, collapsible = false, className, children }: AccordionProps) => {
  const [openItems, setOpenItems] = React.useState<Set<string>>(new Set())

  const toggleItem = (value: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev)
      if (type === "single") {
        if (newSet.has(value)) {
          if (collapsible) {
            newSet.clear()
          }
        } else {
          newSet.clear()
          newSet.add(value)
        }
      } else {
        if (newSet.has(value)) {
          newSet.delete(value)
        } else {
          newSet.add(value)
        }
      }
      return newSet
    })
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps {
  value: string
  className?: string
  children: React.ReactNode
}

const AccordionItem = ({ value, className, children }: AccordionItemProps) => {
  return (
    <div className={className} data-value={value}>
      {children}
    </div>
  )
}

interface AccordionTriggerProps {
  className?: string
  children: React.ReactNode
}

const AccordionTrigger = ({ className, children }: AccordionTriggerProps) => {
  const context = React.useContext(AccordionContext)
  const itemValue = React.useContext(AccordionItemContext)
  
  if (!context || !itemValue) {
    throw new Error("AccordionTrigger must be used within AccordionItem")
  }

  const isOpen = context.openItems.has(itemValue)

  return (
    <button
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
        className
      )}
      onClick={() => context.toggleItem(itemValue)}
    >
      {children}
      <ChevronDown 
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )} 
      />
    </button>
  )
}

interface AccordionContentProps {
  className?: string
  children: React.ReactNode
}

const AccordionItemContext = React.createContext<string | undefined>(undefined)

const AccordionContent = ({ className, children }: AccordionContentProps) => {
  const context = React.useContext(AccordionContext)
  const itemValue = React.useContext(AccordionItemContext)
  
  if (!context || !itemValue) {
    throw new Error("AccordionContent must be used within AccordionItem")
  }

  const isOpen = context.openItems.has(itemValue)

  return (
    <div 
      className={cn(
        "overflow-hidden transition-all duration-200 ease-out",
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}
    >
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </div>
  )
}

// Enhanced AccordionItem that provides context
const AccordionItemWithContext = ({ value, className, children }: AccordionItemProps) => {
  return (
    <AccordionItemContext.Provider value={value}>
      <div className={className} data-value={value}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

export { 
  Accordion, 
  AccordionItemWithContext as AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
}
