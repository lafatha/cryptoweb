import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminJWT } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify token
    const decoded = await verifyAdminJWT(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: decoded }, { status: 200 });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
