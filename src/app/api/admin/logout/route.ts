import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const res = NextResponse.json({ success: true });
    
    // Clear the admin token cookie (using consistent name)
    res.cookies.set('admin-token', '', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/', 
      maxAge: 0 
    });
    
    return res;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
