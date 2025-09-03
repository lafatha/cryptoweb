import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Get current session
    const token = await getToken({ req: request });

    if (!token) {
      return NextResponse.json({
        ok: false,
        code: "NO_SESSION",
        message: "No active session found"
      }, { status: 401 });
    }

    // Get wallet address from request body
    const body = await request.json();
    const { walletAddress, walletType = 'metamask' } = body;

    if (!walletAddress) {
      return NextResponse.json({
        ok: false,
        code: "INVALID_REQUEST",
        message: "Wallet address is required"
      }, { status: 400 });
    }

    // Validate wallet address format
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({
        ok: false,
        code: "INVALID_ADDRESS",
        message: "Invalid wallet address format"
      }, { status: 400 });
    }

    // In a real implementation, you would update the session here
    // For NextAuth, we can't directly modify the session from an API route
    // Instead, we'll return the wallet address and let the client handle it
    // Or we could use a database approach

    // For now, we'll return success and the wallet info
    // The client should store this in localStorage or handle it appropriately
    return NextResponse.json({
      ok: true,
      walletAddress,
      walletType,
      message: "Wallet connected successfully"
    });

  } catch (error) {
    console.error('Error in wallet connect:', error);
    return NextResponse.json({
      ok: false,
      code: "INTERNAL_ERROR",
      message: "Internal server error"
    }, { status: 500 });
  }
}
