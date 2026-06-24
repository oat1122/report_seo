import { requireStaff } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { DomainDataManager } from '@/features/users/presentation/components/MetricsModal/DomainDataManager'

export const metadata = {
  title: 'จัดการข้อมูล Domain · SEO',
}

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function SeoDomainDataPage({ params }: PageProps) {
  await requireStaff()
  const { userId } = await params
  return (
    <DashboardLayout>
      <DomainDataManager userId={userId} basePath="/seo" />
    </DashboardLayout>
  )
}
