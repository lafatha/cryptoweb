export type ArticleCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  published_at: string | null;
};

export type ArticleDetail = {
  title: string;
  content: string | null;
  category: string | null;
  source_url: string | null;
  published_at: string | null;
};
