'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/slugify';

export default function NewArticlePage() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('News');
  const [pub, setPub] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    
    const payload = {
      title,
      slug: slug || slugify(title),
      excerpt,
      content,
      category,
      is_published: pub,
      published_at: pub ? new Date().toISOString() : null
    };
    
    const r = await fetch('/api/admin/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    setLoading(false);
    
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setErr(j.error || 'Gagal simpan');
      return;
    }
    
    router.push('/admin');
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Tambah Artikel</h1>
      {err && <p className="text-red-600 mb-2">{err}</p>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded p-2"
          placeholder="Judul"
          value={title}
          onChange={e => {
            setTitle(e.target.value);
            if (!slug) setSlug(slugify(e.target.value));
          }}
          required
        />
        <input
          className="w-full border rounded p-2"
          placeholder="Slug"
          value={slug}
          onChange={e => setSlug(e.target.value)}
          required
        />
        <input
          className="w-full border rounded p-2"
          placeholder="Kategori"
          value={category}
          onChange={e => setCategory(e.target.value)}
        />
        <textarea
          className="w-full border rounded p-2"
          placeholder="Excerpt"
          rows={3}
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
        />
        <textarea
          className="w-full border rounded p-2"
          placeholder="Content"
          rows={10}
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={pub}
            onChange={e => setPub(e.target.checked)}
          />
          Publish sekarang
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
