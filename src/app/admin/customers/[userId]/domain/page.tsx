import { requireAdmin } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { CustomerWorkspaceHeader } from '@/features/users/presentation/components/workspace/CustomerWorkspaceHeader'
import { DomainDataManager } from '@/features/users/presentation/components/MetricsModal/DomainDataManager'

export const metadata = {
  title: 'จัดการข้อมูล Domain · Admin',
}

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function AdminDomainDataPage({ params }: PageProps) {
  await requireAdmin()
  const { userId } = await params
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <CustomerWorkspaceHeader userId={userId} basePath="/admin" />
        <DomainDataManager userId={userId} />
      </div>
    </DashboardLayout>
  )
}
