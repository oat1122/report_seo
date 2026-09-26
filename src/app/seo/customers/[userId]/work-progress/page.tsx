import { requireStaff } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { CustomerWorkspaceHeader } from '@/features/users/presentation/components/workspace/CustomerWorkspaceHeader'
import { PlanList } from '@/features/work-progress/presentation/components/plan/PlanList'

export const metadata = {
  title: 'Work Progress · SEO',
}

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function SeoWorkProgressListPage({ params }: PageProps) {
  await requireStaff()
  const { userId } = await params
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <CustomerWorkspaceHeader userId={userId} basePath="/seo" />
        <PlanList userId={userId} basePath={`/seo/customers/${userId}/work-progress`} />
      </div>
    </DashboardLayout>
  )
}
