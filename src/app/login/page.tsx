import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-utils'
import { Role } from '@/types/auth'
import LoginForm from '@/features/auth/presentation/LoginForm'

export default async function LoginPage() {
  const role = (await getSession())?.user?.role

  if (role === Role.ADMIN) redirect('/admin')
  if (role === Role.SEO_DEV) redirect('/seo')
  if (role === Role.CUSTOMER) redirect('/customer')

  return <LoginForm />
}
