// src/app/customer/[userId]/report/page.tsx
import { notFound, redirect } from 'next/navigation'
import { z } from 'zod'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import ReportPage from '@/features/customer-report/presentation/ReportPage'
import { requireRole } from '@/lib/auth-utils'
import { getCustomerReport } from '@/features/customer-report'
import { customerAccessGuard } from '@/infrastructure/http'
import { ForbiddenError, NotFoundError, UnauthorizedError } from '@/lib/errors'
import { Role } from '@/types/auth'
import type { CustomerReportData } from '@/hooks/api/useCustomersApi'

const userIdSchema = z.uuid()

export default async function AdminViewCustomerReportPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  await requireRole([Role.ADMIN, Role.SEO_DEV, Role.CUSTOMER])
  const { userId } = await params
  if (!userIdSchema.safeParse(userId).success) {
    notFound()
  }

  // ปิด IDOR: CUSTOMER A ห้ามดู report ของ CUSTOMER B ผ่าน URL
  // canRead = ADMIN | owner | assigned SEO_DEV
  try {
    await customerAccessGuard({ byUserId: userId }, 'read')
  } catch (err) {
    if (err instanceof NotFoundError) notFound()
    if (err instanceof ForbiddenError || err instanceof UnauthorizedError) {
      redirect('/unauthorized')
    }
    throw err
  }

  const reportData = await getCustomerReport(userId)
  const initialData = JSON.parse(JSON.stringify(reportData)) as CustomerReportData

  return (
    <DashboardLayout>
      <ReportPage customerId={userId} initialData={initialData} />
    </DashboardLayout>
  )
}
