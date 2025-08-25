import { supabaseService } from '@/lib/supabaseService';

export async function listArticlesAdmin() {
  const { data, error } = await supabaseService
    .from('articles')
    .select('id, slug, title, excerpt, category, is_published, published_at, updated_at')
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data ?? [];
}

export async function getArticleById(id: string) {
  const { data, error } = await supabaseService
    .from('articles')
    .select('id, slug, title, excerpt, content, category, is_published, published_at')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

interface ArticlePayload {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  category?: string;
  is_published?: boolean;
  published_at?: string | null;
}

export async function createArticle(payload: ArticlePayload) {
  const { data, error } = await supabaseService
    .from('articles')
    .insert(payload)
    .select('id, slug')
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateArticle(id: string, payload: Partial<ArticlePayload>) {
  const { data, error } = await supabaseService
    .from('articles')
    .update(payload)
    .eq('id', id)
    .select('id, slug')
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteArticle(id: string) {
  const { error } = await supabaseService
    .from('articles')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}
