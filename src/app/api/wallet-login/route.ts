import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, signature, message } = body

    if (!address || !signature || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate Ethereum address format
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      )
    }

    // In production, you would:
    // 1. Verify the signature against the message and address
    // 2. Check that the message contains a valid nonce
    // 3. Ensure the nonce hasn't been used before
    // 4. Verify the signature using a library like ethers.js or viem

    // For demo purposes, we'll just validate the basic structure
    console.log('Wallet login attempt:', { address, message })

    // Return success - the actual JWT creation happens in NextAuth
    return NextResponse.json({ 
      success: true, 
      address,
      message: 'Wallet login successful' 
    })

  } catch (error) {
    console.error('Wallet login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
