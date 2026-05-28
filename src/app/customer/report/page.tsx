// src/app/customer/report/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import ReportPage from '@/features/customer-report/presentation/ReportPage'
import { requireCustomer } from '@/lib/auth-utils'
import { getCustomerReport } from '@/features/customer-report'
import type { CustomerReportData } from '@/hooks/api/useCustomersApi'

export const metadata: Metadata = {
  title: 'รายงาน SEO | SEO Report',
}

export default async function CustomerReportPage() {
  const session = await requireCustomer()
  const reportData = await getCustomerReport(session.user.id)
  // JSON-serialize ให้ Date → string ตรงกับ shape ของ React Query
  const initialData = JSON.parse(JSON.stringify(reportData)) as CustomerReportData

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-screen-xl px-4 pt-4 md:px-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/customer">
            <ArrowLeft className="mr-1.5 size-4" />
            กลับหน้าหลัก
          </Link>
        </Button>
      </div>
      <ReportPage customerId={session.user.id} initialData={initialData} />
    </DashboardLayout>
  )
}
