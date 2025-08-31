import { NextResponse } from 'next/server'
import { isHexAddress, toChecksum, isENS, normalizeInput } from '@/lib/chain'

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface ResolveResponse {
  ok: boolean
  address?: string
  code?: string
  message?: string
}

export async function GET(request: Request): Promise<NextResponse<ResolveResponse>> {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')

  if (!q) {
    return NextResponse.json(
      { ok: false, code: 'INVALID_INPUT', message: 'Query parameter q is required' },
      { status: 400 }
    )
  }

  try {
    const normalized = normalizeInput(q)

    // If already a hex address, validate and checksum
    if (isHexAddress(normalized)) {
      try {
        const checksummed = toChecksum(normalized)
        return NextResponse.json(
          { ok: true, address: checksummed },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
          }
        )
      } catch (error) {
        return NextResponse.json(
          { ok: false, code: 'INVALID_INPUT', message: 'Invalid hex address format' },
          { status: 400 }
        )
      }
    }

    // If ENS domain, resolve via Moralis
    if (isENS(normalized)) {
      const moralisApiKey = process.env.MORALIS_API_KEY

      if (!moralisApiKey) {
        console.error('MORALIS_API_KEY not configured')
        return NextResponse.json(
          { ok: false, code: 'SERVICE_UNAVAILABLE', message: 'ENS resolution service not available' },
          { status: 503 }
        )
      }

      try {
        const moralisUrl = `https://deep-index.moralis.io/api/v2.2/resolve/ens/${encodeURIComponent(normalized)}`
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

        const response = await fetch(moralisUrl, {
          headers: {
            'X-API-Key': moralisApiKey,
            'Accept': 'application/json'
          },
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (response.status === 404) {
          return NextResponse.json(
            { ok: false, code: 'NOT_FOUND', message: 'ENS domain not found' },
            { status: 404 }
          )
        }

        if (!response.ok) {
          console.error(`Moralis ENS resolution error: ${response.status}`)
          return NextResponse.json(
            { ok: false, code: 'RESOLVER_ERROR', message: 'Failed to resolve ENS' },
            { status: 502 }
          )
        }

        const data = await response.json()
        
        if (!data.address || !isHexAddress(data.address)) {
          return NextResponse.json(
            { ok: false, code: 'INVALID_RESPONSE', message: 'Invalid address from resolver' },
            { status: 502 }
          )
        }

        const checksummed = toChecksum(data.address)
        
        return NextResponse.json(
          { ok: true, address: checksummed },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
          }
        )

      } catch (error: any) {
        if (error.name === 'AbortError') {
          return NextResponse.json(
            { ok: false, code: 'TIMEOUT', message: 'ENS resolution timeout' },
            { status: 408 }
          )
        }

        console.error('ENS resolution error:', error)
        return NextResponse.json(
          { ok: false, code: 'RESOLVER_ERROR', message: 'ENS resolution failed' },
          { status: 502 }
        )
      }
    }

    // Invalid input format
    return NextResponse.json(
      { ok: false, code: 'INVALID_INPUT', message: 'Input must be hex address or ENS domain' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Wallet resolve error:', error)
    return NextResponse.json(
      { ok: false, code: 'SERVER_ERROR', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
