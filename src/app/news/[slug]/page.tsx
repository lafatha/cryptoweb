import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { ArticleDetail } from '@/types/article';

export const revalidate = 60;

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { data, error } = await supabase
    .from('articles')
    .select('title, content, category, source_url, published_at')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (error || !data) return notFound();

  const a = data as ArticleDetail;
  const d = a.published_at ? new Date(a.published_at) : null;

  return (
    <article className="mx-auto max-w-3xl p-6">
      <a href="/news" className="text-sm text-blue-600 hover:underline">← Back to News</a>
      <h1 className="mt-2 text-3xl font-bold">{a.title}</h1>
      <div className="mt-1 text-sm text-neutral-500">
        {a.category ?? 'News'} {d ? '• ' + d.toLocaleString() : null}
      </div>

      <div className="prose mt-6">
        {a.content
          ? a.content.split('\n').map((p: string, i: number) => <p key={i}>{p}</p>)
          : <p>No content.</p>}
      </div>

      {a.source_url && (
        <a className="mt-8 inline-flex items-center gap-2 text-blue-600 hover:underline"
           href={a.source_url} target="_blank" rel="noreferrer">
          Source ↗
        </a>
      )}
    </article>
  );
}
