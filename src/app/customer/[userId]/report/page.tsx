// src/app/customer/[userId]/report/page.tsx
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import ReportPage from '@/features/customer-report/presentation/ReportPage'
import { requireCustomerPageAccess, requireRole } from '@/lib/auth-utils'
import { getCustomerReport } from '@/features/customer-report'
import { Role } from '@/types/auth'
import type { CustomerReportData } from '@/hooks/api/useCustomersApi'

export default async function AdminViewCustomerReportPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  await requireRole([Role.ADMIN, Role.SEO_DEV, Role.CUSTOMER])
  const { userId } = await params
  // ปิด IDOR: CUSTOMER A ห้ามดู report ของ CUSTOMER B ผ่าน URL (canRead = ADMIN | owner | assigned SEO_DEV)
  await requireCustomerPageAccess(userId)

  const reportData = await getCustomerReport(userId)
  const initialData = JSON.parse(JSON.stringify(reportData)) as CustomerReportData

  return (
    <DashboardLayout>
      <ReportPage customerId={userId} initialData={initialData} />
    </DashboardLayout>
  )
}
