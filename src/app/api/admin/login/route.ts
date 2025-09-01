import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabaseService';
import bcrypt from 'bcryptjs';
import { signAdminJWT } from '@/lib/jwt';

// Cache untuk mengurangi database queries saat login
let userCache: { [username: string]: { data: any, timestamp: number } } = {};
const CACHE_DURATION = 300000; // 5 menit

export async function POST(req: Request) {
  try {
    const startTime = Date.now();
    const { username, password } = await req.json();
    
    // Validation
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Sanitize input
    const cleanUsername = username.trim().toLowerCase();
    
    // Check cache first
    const now = Date.now();
    const cachedUser = userCache[cleanUsername];
    let userData = null;

    if (cachedUser && (now - cachedUser.timestamp) < CACHE_DURATION) {
      console.log('🚀 Using cached user data for:', cleanUsername);
      userData = cachedUser.data;
    } else {
      // Fetch from database
      console.log('🔍 Fetching user from database:', cleanUsername);
      const { data, error } = await supabaseService
        .from('admin_users')
        .select('id, username, password_hash')
        .eq('username', cleanUsername)
        .single();

      if (error || !data) {
        // Add delay to prevent brute force attacks
        await new Promise(resolve => setTimeout(resolve, 1000));
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      userData = data;
      
      // Update cache
      userCache[cleanUsername] = {
        data: userData,
        timestamp: now
      };
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
    if (!isPasswordValid) {
      // Add delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate JWT token
    const token = await signAdminJWT({ 
      sub: userData.id, 
      username: userData.username,
      iat: Math.floor(Date.now() / 1000)
    });
    
    const response = NextResponse.json({ 
      success: true,
      responseTime: Date.now() - startTime
    });
    
    // Set secure cookie
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    console.log('✅ Login successful for:', cleanUsername, 'in', Date.now() - startTime, 'ms');
    return response;
    
  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
