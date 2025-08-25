import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabaseService';
import bcrypt from 'bcryptjs';
import { signAdminJWT } from '@/lib/jwt';

const COOKIE = 'admin_session';

export async function POST(req: Request) {
  const { username, password } = await req.json();
  
  if (!username || !password) {
    return NextResponse.json({ error: 'Required' }, { status: 400 });
  }

  const { data, error } = await supabaseService
    .from('admin_users')
    .select('id, username, password_hash')
    .eq('username', username)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  const ok = await bcrypt.compare(password, data.password_hash);
  if (!ok) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = await signAdminJWT({ sub: data.id, username: data.username });
  const res = NextResponse.json({ success: true });
  
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  
  return res;
}
