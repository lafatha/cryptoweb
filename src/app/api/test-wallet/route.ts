import { NextResponse } from 'next/server'

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  return NextResponse.json({ 
    ok: true, 
    message: "Test API working",
    timestamp: new Date().toISOString()
  })
}
