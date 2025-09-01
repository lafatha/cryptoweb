import { NextResponse } from 'next/server';
import { updateArticle } from '@/lib/data/articles';
import { supabaseService } from '@/lib/supabaseService';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Helper function untuk verifikasi admin (sama seperti di route.ts)
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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify admin session
    await verifyAdmin();
    
    const { id } = await params;
    const payload = await req.json();
    
    // Validate required fields
    if (!payload.title || !payload.content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }
    
    const data = await updateArticle(id, payload);
    
    // Revalidate paths
    revalidatePath('/admin');
    revalidatePath('/news');
    revalidatePath(`/news/${data.slug}`);
    
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('❌ Update article error:', error);
    if (error.message === 'Unauthorized' || error.message === 'Invalid token') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session
    await verifyAdmin();
    
    const { id } = await params;

    // Validate ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
    }

    // Delete article dengan optimisasi
    console.log('🗑️ Deleting article:', id);
    
    const { error } = await supabaseService
      .from('articles')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Database error deleting article:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Revalidate paths setelah delete
    revalidatePath('/admin');
    revalidatePath('/news');

    console.log('✅ Article deleted successfully');
    
    // Response dengan cache headers
    const response = NextResponse.json({ success: true });
    response.headers.set('Cache-Control', 'no-cache');
    
    return response;
    
  } catch (error: any) {
    console.error('❌ Delete API route error:', error);
    if (error.message === 'Unauthorized' || error.message === 'Invalid token') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
