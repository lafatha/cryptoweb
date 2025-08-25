import { NextResponse } from 'next/server';
import { createArticle } from '@/lib/data/articles';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const data = await createArticle(payload);
    
    revalidatePath('/admin');
    revalidatePath('/news');
    revalidatePath(`/news/${data.slug}`);
    
    return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ error: error.message || 'Create failed' }, { status: 400 });
  }
}
