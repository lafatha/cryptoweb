'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/Admin/RichTextEditor'), { 
  ssr: false,
  loading: () => <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 min-h-[200px] flex items-center justify-center text-cyan-100">Loading editor...</div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 p-6">
      {/* Background ocean effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl animate-ping" />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Edit Artikel</h1>
              <p className="text-sm text-cyan-100/80">Update your article content</p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {err && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-300/30 rounded-xl p-4 mb-6">
            <p className="text-red-200 text-sm">{err}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-cyan-100/90 text-sm font-medium">Judul</label>
              <input
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-cyan-100/50 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200"
                placeholder="Masukkan judul artikel"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label className="text-cyan-100/90 text-sm font-medium">Slug</label>
              <input
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-cyan-100/50 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200"
                placeholder="url-friendly-slug"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-cyan-100/90 text-sm font-medium">Kategori</label>
              <input
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-cyan-100/50 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200"
                placeholder="Kategori artikel"
                value={category}
                onChange={e => setCategory(e.target.value)}
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <label className="text-cyan-100/90 text-sm font-medium">Excerpt</label>
              <textarea
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-cyan-100/50 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200 resize-none"
                placeholder="Ringkasan singkat artikel"
                rows={3}
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="text-cyan-100/90 text-sm font-medium">Content</label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Edit your article content..."
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl"
              />
            </div>

            {/* Publish checkbox */}
            <div className="flex items-center space-x-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <input
                type="checkbox"
                id="publish"
                checked={pub}
                onChange={e => setPub(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-400/20 focus:ring-2"
              />
              <label htmlFor="publish" className="text-cyan-100/90 text-sm font-medium">
                Published
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </div>
              ) : (
                'Update Artikel'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
