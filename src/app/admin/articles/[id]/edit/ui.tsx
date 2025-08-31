'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/Admin/RichTextEditor'), { 
  ssr: false,
  loading: () => <div className="border rounded-lg p-4 min-h-[200px] flex items-center justify-center text-gray-500">Loading editor...</div>
});

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  is_published: boolean;
  published_at: string | null;
}

export default function EditForm({ a }: { a: Article }) {
  const [title, setTitle] = useState(a.title || '');
  const [slug, setSlug] = useState(a.slug || '');
  const [excerpt, setExcerpt] = useState(a.excerpt || '');
  const [content, setContent] = useState(a.content || '');
  const [category, setCategory] = useState(a.category || 'News');
  const [pub, setPub] = useState(!!a.is_published);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    
    const payload = {
      title,
      slug,
      excerpt,
      content,
      category,
      is_published: pub,
      published_at: pub ? (a.published_at || new Date().toISOString()) : null
    };
    
    const r = await fetch(`/api/admin/articles/${a.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    setLoading(false);
    
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setErr(j.error || 'Update failed');
      return;
    }
    
    router.push('/admin');
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Edit Artikel</h1>
      {err && <p className="text-red-600 mb-2">{err}</p>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded p-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
        />
        <input
          className="w-full border rounded p-2"
          value={slug}
          onChange={e => setSlug(e.target.value)}
          placeholder="Slug"
        />
        <input
          className="w-full border rounded p-2"
          value={category}
          onChange={e => setCategory(e.target.value)}
          placeholder="Category"
        />
        <textarea
          className="w-full border rounded p-2"
          rows={3}
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          placeholder="Excerpt"
        />
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Edit your article content..."
            className="border rounded-lg"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={pub}
            onChange={e => setPub(e.target.checked)}
          />
          Published
        </label>
        <button
          className="rounded bg-black text-white px-4 py-2"
          disabled={loading}
        >
          {loading ? 'Menyimpan…' : 'Simpan'}
        </button>
      </form>
    </main>
  );
}
