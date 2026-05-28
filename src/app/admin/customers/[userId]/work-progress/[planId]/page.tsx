import { requireAdmin } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { PlanGrid } from '@/features/work-progress/presentation/components/plan/PlanGrid'
import { PlanHeaderBar } from '@/features/work-progress/presentation/components/plan/PlanHeaderBar'
import { PlanDashboardPanel } from '@/features/work-progress/presentation/components/summary/PlanDashboardPanel'

export const metadata = {
  title: 'Work Progress · Plan · Admin',
}

interface PageProps {
  params: Promise<{ userId: string; planId: string }>
}

export default async function AdminPlanDetailPage({ params }: PageProps) {
  await requireAdmin()
  const { userId, planId } = await params
  const basePath = `/admin/customers/${userId}/work-progress`
  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
        <PlanHeaderBar userId={userId} planId={planId} backHref={basePath} />
        <PlanGrid userId={userId} planId={planId} />
        <PlanDashboardPanel userId={userId} planId={planId} />
      </div>
    </DashboardLayout>
  )
}
