import { notFound } from 'next/navigation'
import { requireCustomer } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { PlanList } from '@/features/work-progress/presentation/components/plan/PlanList'

export const metadata = {
  title: 'Work Progress | SEO Report',
}

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function CustomerWorkProgressListPage({ params }: PageProps) {
  const session = await requireCustomer()
  const { userId } = await params
  if (userId !== session.user.id) notFound()

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-1">
          <h1 className="text-[26px] leading-tight font-semibold sm:text-[28px]">Work Progress</h1>
          <p className="text-text-secondary text-sm">
            ทีมทำอะไรให้แล้วบ้าง? — ความคืบหน้าของแผนงาน SEO
          </p>
        </header>
        <PlanList userId={userId} basePath={`/customer/${userId}/work-progress`} readOnly />
      </div>
    </DashboardLayout>
  )
}
