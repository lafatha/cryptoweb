import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSavedWallet } from '@/lib/wallet-portfolio';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get session token from NextAuth
    const token = await getToken({ req: request });

    if (!token) {
      return Response.json({
        ok: false,
        code: "NO_SESSION",
        message: "No active session found"
      }, { status: 401 });
    }

    let walletAddress: string | null = null;

    // First, try to get wallet address from session (for wallet login)
    if (token.walletAddress) {
      walletAddress = token.walletAddress as string;
    }

    // Second, try to get wallet address from request headers (set by client from localStorage)
    const clientWalletAddress = request.headers.get('x-wallet-address');
    if (!walletAddress && clientWalletAddress) {
      // Validate the wallet address format
      if (clientWalletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        walletAddress = clientWalletAddress;
      }
    }

    // Third, try to get from database if we have a user ID
    // This is a fallback for users who have saved wallets
    if (!walletAddress && token.id) {
      // For demo purposes, we'll check if there's a saved wallet
      // In production, you'd want a proper user-wallet mapping
      try {
        // This is a simplified approach - in production you'd have user_id in wallets table
        const savedWallet = await getSavedWallet('demo-wallet-address'); // This won't work
        if (savedWallet) {
          walletAddress = savedWallet.wallet_address;
        }
      } catch (error) {
        console.error('Error checking saved wallet:', error);
      }
    }

    // If still no wallet address, user needs to connect wallet
    if (!walletAddress) {
      return Response.json({
        ok: false,
        code: "NO_WALLET",
        message: "Please connect your MetaMask wallet first"
      }, { status: 401 });
    }

    // Extract chain from query params (default to eth)
    const url = new URL(request.url);
    const chain = url.searchParams.get('chain') || 'eth';

    // Call existing wallet portfolio API
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const response = await fetch(
      `${baseUrl}/api/wallet/portfolio?address=${walletAddress}&chain=${chain}`,
      {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      return Response.json({
        ok: false,
        code: "PORTFOLIO_ERROR",
        message: "Failed to fetch portfolio data"
      }, { status: response.status });
    }

    const portfolioData = await response.json();

    return Response.json({
      ok: true,
      portfolio: portfolioData.portfolio,
      wallet_address: walletAddress,
      chain: chain
    });

  } catch (error) {
    console.error('Error in session-based portfolio:', error);
    return Response.json({
      ok: false,
      code: "INTERNAL_ERROR",
      message: "Internal server error"
    }, { status: 500 });
  }
}