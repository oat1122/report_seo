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

// ลำดับตามดีไซน์ฝั่งลูกค้า: การ์ดแผน → สรุปสถานะ/หมวด → ตารางงานรายเดือน
export default async function CustomerPlanDetailPage({ params }: PageProps) {
  const session = await requireCustomer()
  const { userId, planId } = await params
  if (userId !== session.user.id) notFound()
  const basePath = `/customer/${userId}/work-progress`

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-1">
          <h1 className="text-[26px] leading-tight font-semibold sm:text-[28px]">Work Progress</h1>
          <p className="text-text-secondary text-sm">
            ทีมทำอะไรให้แล้วบ้าง? — ความคืบหน้าของแผนงาน SEO
          </p>
        </header>
        <PlanHeaderBar userId={userId} planId={planId} backHref={basePath} readOnly />
        <PlanDashboardPanel userId={userId} planId={planId} />
        <PlanGrid userId={userId} planId={planId} readOnly />
      </div>
    </DashboardLayout>
  )
}
