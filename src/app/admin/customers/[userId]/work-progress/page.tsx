import { requireAdmin } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { CustomerWorkspaceHeader } from '@/features/users/presentation/components/workspace/CustomerWorkspaceHeader'
import { PlanList } from '@/features/work-progress/presentation/components/plan/PlanList'

export const metadata = {
  title: 'Work Progress · Admin',
}

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function AdminWorkProgressListPage({ params }: PageProps) {
  await requireAdmin()
  const { userId } = await params
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <CustomerWorkspaceHeader userId={userId} basePath="/admin" />
        <PlanList userId={userId} basePath={`/admin/customers/${userId}/work-progress`} />
      </div>
    </DashboardLayout>
  )
}
