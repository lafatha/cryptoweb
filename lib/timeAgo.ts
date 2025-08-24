export function timeAgo(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const diffSec = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  const m = Math.floor(diffSec / 60);
  const h = Math.floor(m / 60);
  const dys = Math.floor(h / 24);
  if (dys >= 7) return d.toLocaleDateString();
  if (dys >= 1) return `${dys}d ago`;
  if (h >= 1) return `${h}h ago`;
  if (m >= 1) return `${m}m ago`;
  return `just now`;
}
