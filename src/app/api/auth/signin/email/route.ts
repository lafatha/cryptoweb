import { NextRequest, NextResponse } from 'next/server'
import { signIn } from 'next-auth/react'

export async function POST(request: NextRequest) {
  try {
    // Redirect ke halaman signin dengan email provider
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  } catch (error) {
    console.error('Email signin error:', error)
    return NextResponse.redirect(new URL('/auth/signin?error=Configuration', request.url))
  }
}
