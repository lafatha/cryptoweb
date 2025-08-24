import Link from 'next/link';
import { timeAgo } from '@/lib/timeAgo';
import type { ArticleCard as TCard } from '@/types/article';

export default function ArticleCard({ a }: { a: TCard }) {
  return (
    <article className="group rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
          {a.category ?? 'News'}
        </span>
        <span>{timeAgo(a.published_at)}</span>
      </div>

      <Link href={`/news/${a.slug}`} className="block">
        <h2 className="text-lg font-semibold leading-tight mb-3 group-hover:text-primary transition-colors">
          {a.title}
        </h2>
      </Link>

      {a.excerpt && (
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
          {a.excerpt}
        </p>
      )}

      <div className="pt-2 border-t">
        <Link
          href={`/news/${a.slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline transition-all"
        >
          Read more 
          <span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}
