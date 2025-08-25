import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminJWT } from '@/lib/jwt';

const COOKIE = 'admin_session';

export async function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;
  
  if (p.startsWith('/admin') && p !== '/admin/login') {
    const token = req.cookies.get(COOKIE)?.value;
    const ok = token ? await verifyAdminJWT(token) : null;
    
    if (!ok) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
