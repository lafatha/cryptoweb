import Link from 'next/link';
import { listArticlesAdmin, deleteArticle } from '@/lib/data/articles';
import { revalidatePath } from 'next/cache';

export default async function AdminHome() {
  const items = await listArticlesAdmin();

  async function deleteAction(formData: FormData) {
    'use server';
    const id = String(formData.get('id'));
    await deleteArticle(id);
    revalidatePath('/admin');
    revalidatePath('/news');
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Articles</h2>
        <Link
          href="/admin/articles/new"
          className="rounded bg-blue-600 text-white px-3 py-2"
        >
          Tambah Artikel
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-neutral-500">Belum ada artikel.</p>
      ) : (
        <ul className="space-y-2">
          {items.map(a => (
            <li key={a.id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-neutral-500">
                  {a.is_published ? 'Published' : 'Draft'} • {a.published_at ? new Date(a.published_at).toLocaleString() : '-'}
                </div>
              </div>
              <div className="flex gap-3">
                <Link href={`/admin/articles/${a.id}/edit`} className="underline">
                  Edit
                </Link>
                <Link href={`/news/${a.slug}`} className="underline" target="_blank">
                  View
                </Link>
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="text-red-600 underline" type="submit">
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
