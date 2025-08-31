import { NextResponse } from 'next/server';
import { updateArticle } from '@/lib/data/articles';
import { revalidatePath } from 'next/cache';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await req.json();
    const data = await updateArticle(id, payload);
    
    revalidatePath('/admin');
    revalidatePath('/news');
    revalidatePath(`/news/${data.slug}`);
    
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 400 });
  }
}
