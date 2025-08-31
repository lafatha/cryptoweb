'use client';

interface DeleteButtonProps {
  articleId: string;
  deleteAction: (formData: FormData) => Promise<void>;
}

export default function DeleteButton({ articleId, deleteAction }: DeleteButtonProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      e.preventDefault();
      return;
    }
  };

  return (
    <form action={deleteAction} onSubmit={handleSubmit} className="inline-block">
      <input type="hidden" name="id" value={articleId} />
      <button 
        type="submit"
        className="inline-flex items-center p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete article"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </form>
  );
}
