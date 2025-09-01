"use client"

import { useState } from 'react'
import Image from 'next/image'

interface CryptoIconProps {
  symbol: string
  size?: number
  className?: string
}

const CRYPTO_LOGOS: Record<string, string> = {
  'ETH': '/crypto-icons/eth.svg',
  'BTC': '/crypto-icons/btc.svg',
  'USDT': '/crypto-icons/usdt.svg',
  'USDC': '/crypto-icons/usdc.svg',
  'LINK': '/crypto-icons/link.svg',
  'UNI': '/crypto-icons/uni.svg',
}

export function CryptoIcon({ symbol, size = 25, className = '' }: CryptoIconProps) {
  const [imageError, setImageError] = useState(false)
  
  const logoUrl = CRYPTO_LOGOS[symbol.toUpperCase()]
  
  if (!logoUrl || imageError) {
    // Fallback to text
    return (
      <div 
        className={`rounded-full bg-muted flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span 
          className="font-bold text-foreground"
          style={{ fontSize: size * 0.3 }}
        >
          {symbol.charAt(0)}
        </span>
      </div>
    )
  }

  return (
    <div 
      className={`rounded-full bg-transparent flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={logoUrl}
        alt={`${symbol} logo`}
        width={size}
        height={size}
        className="rounded-full"
        onError={() => setImageError(true)}
        priority={symbol === 'ETH'}
      />
    </div>
  )
}
