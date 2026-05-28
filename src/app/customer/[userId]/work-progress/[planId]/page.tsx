import { notFound } from 'next/navigation'
import { requireCustomer } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { PlanGrid } from '@/features/work-progress/presentation/components/plan/PlanGrid'
import { PlanHeaderBar } from '@/features/work-progress/presentation/components/plan/PlanHeaderBar'
import { PlanDashboardPanel } from '@/features/work-progress/presentation/components/summary/PlanDashboardPanel'

export const metadata = {
  title: 'Plan | SEO Report',
}

interface PageProps {
  params: Promise<{ userId: string; planId: string }>
}

export default async function CustomerPlanDetailPage({ params }: PageProps) {
  const session = await requireCustomer()
  const { userId, planId } = await params
  if (userId !== session.user.id) notFound()
  const basePath = `/customer/${userId}/work-progress`

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-6">
        <PlanHeaderBar userId={userId} planId={planId} backHref={basePath} readOnly />
        <PlanGrid userId={userId} planId={planId} readOnly />
        <PlanDashboardPanel userId={userId} planId={planId} />
      </div>
    </DashboardLayout>
  )
}
