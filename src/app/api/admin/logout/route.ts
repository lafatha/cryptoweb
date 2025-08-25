import { NextResponse } from 'next/server';

const COOKIE = 'admin_session';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE, '', { 
    httpOnly: true, 
    path: '/', 
    maxAge: 0 
  });
  return res;
}
