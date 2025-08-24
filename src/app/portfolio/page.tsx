import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function PortfolioRedirectPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/portfolio')
  }
  
  redirect('/dashboard/portfolio')
}
