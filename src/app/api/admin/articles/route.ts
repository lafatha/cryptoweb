import { NextResponse } from 'next/server';
import { createArticle } from '@/lib/data/articles';
import { supabaseService } from '@/lib/supabaseService';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Cache untuk mengurangi database queries
let articlesCache: { data: any[], timestamp: number } | null = null;
const CACHE_DURATION = 30000; // 30 detik

// Helper function untuk verifikasi admin
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token');
  
  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    jwt.verify(token.value, process.env.ADMIN_JWT_SECRET!);
    return true;
  } catch {
    throw new Error('Invalid token');
  }
}

export async function GET() {
  try {
    // Verify admin session
    await verifyAdmin();

    // Check cache first
    const now = Date.now();
    if (articlesCache && (now - articlesCache.timestamp) < CACHE_DURATION) {
      console.log('🚀 Returning cached articles');
      return NextResponse.json({ articles: articlesCache.data });
    }

    // Fetch articles dengan optimisasi query dan timeout handling
    console.log('🔍 Fetching articles from database...');
    
    // Create a promise with timeout for Supabase query
    const fetchPromise = supabaseService
      .from('articles')
      .select('id, slug, title, excerpt, category, is_published, published_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(50); // Limit untuk performa

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database query timeout')), 10000)
    );

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
    
    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ 
        error: 'Database connection failed. Please try again later.' 
      }, { status: 500 });
    }

    // Update cache
    articlesCache = {
      data: data || [],
      timestamp: now
    };

    console.log('✅ Articles fetched and cached:', data?.length || 0, 'articles');
    
    // Set cache headers
    const response = NextResponse.json({ articles: data || [] });
    response.headers.set('Cache-Control', 'private, max-age=30');
    response.headers.set('Connection', 'keep-alive');
    
    return response;
    
  } catch (error: any) {
    console.error('❌ API route error:', error);
    if (error.message === 'Unauthorized' || error.message === 'Invalid token') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message === 'Database query timeout') {
      return NextResponse.json({ 
        error: 'Request timeout. Please check your connection and try again.' 
      }, { status: 408 });
    }
    return NextResponse.json({ 
      error: 'Connection interrupted. Please refresh the page.' 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Verify admin session
    await verifyAdmin();
    
    const payload = await req.json();
    
    // Validate required fields
    if (!payload.title || !payload.content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }
    
    const data = await createArticle(payload);
    
    // Clear cache when creating new article
    articlesCache = null;
    
    // Revalidate paths for better performance
    revalidatePath('/admin');
    revalidatePath('/news');
    revalidatePath(`/news/${data.slug}`);
    
    return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('❌ Create article error:', error);
    return NextResponse.json({ error: error.message || 'Create failed' }, { status: 400 });
  }
}
