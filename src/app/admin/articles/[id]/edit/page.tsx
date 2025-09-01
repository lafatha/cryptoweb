import { getArticleById } from '@/lib/data/articles';
import EditForm from './ui';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await getArticleById(id);
  return <EditForm a={a} />;
}
