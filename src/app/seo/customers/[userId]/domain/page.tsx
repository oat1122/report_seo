import { requireCustomerPageAccess, requireStaff } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { CustomerWorkspaceHeader } from '@/features/users/presentation/components/workspace/CustomerWorkspaceHeader'
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
  await requireCustomerPageAccess(userId)
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <CustomerWorkspaceHeader userId={userId} basePath="/seo" />
        <DomainDataManager userId={userId} />
      </div>
    </DashboardLayout>
  )
}
