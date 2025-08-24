export default function LoadingNews() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-10 bg-muted rounded w-80 mb-3 animate-pulse" />
        <div className="h-6 bg-muted rounded w-96 animate-pulse" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="h-6 bg-muted rounded-full w-20 animate-pulse" />
              <div className="h-4 bg-muted rounded w-16 animate-pulse" />
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-5 bg-muted rounded w-full animate-pulse" />
              <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-muted rounded w-full animate-pulse" />
              <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
            </div>
            <div className="pt-2 border-t">
              <div className="h-4 bg-muted rounded w-24 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
