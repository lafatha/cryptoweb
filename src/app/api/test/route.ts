import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'AI API Test Endpoint',
    timestamp: new Date().toISOString(),
    groqApiKey: process.env.GROQ_API_KEY ? 'Set' : 'Missing',
    moralisApiKey: process.env.MORALIS_API_KEY ? 'Set' : 'Missing',
    cryptoPanicApiKey: process.env.CRYPTOPANIC_API_KEY ? 'Set' : 'Missing',
    coinGeckoApiKey: process.env.COINGECKO_API_KEY ? 'Set' : 'Missing'
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      status: 'POST request received',
      timestamp: new Date().toISOString(),
      bodyReceived: !!body,
      groqApiKey: process.env.GROQ_API_KEY ? 'Available' : 'Missing'
    })
  } catch (error) {
    return NextResponse.json({
      status: 'Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}
