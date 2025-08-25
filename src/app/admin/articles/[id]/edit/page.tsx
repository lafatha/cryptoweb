import { getArticleById } from '@/lib/data/articles';
import EditForm from './ui';

export default async function EditPage({ params }: { params: { id: string } }) {
  const a = await getArticleById(params.id);
  return <EditForm a={a} />;
}
