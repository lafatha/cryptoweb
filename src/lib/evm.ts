import { getAddress } from 'viem'

/**
 * Check if a string is a valid Ethereum address
 */
export function isEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Convert address to checksum format using viem
 */
export function toChecksum(address: string): string {
  if (!isEthAddress(address)) {
    throw new Error('Invalid Ethereum address')
  }
  
  try {
    return getAddress(address)
  } catch (error) {
    throw new Error('Failed to checksum address')
  }
}

/**
 * Normalize address input
 */
export function normalizeAddress(input: string): string {
  return input.trim().toLowerCase()
}
