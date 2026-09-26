import { notFound } from 'next/navigation'
import { requireCustomer } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { CustomerPaymentPage } from '@/features/payments/presentation/components/customer/CustomerPaymentPage'

export const metadata = {
  title: 'การชำระเงิน | SEO Report',
}

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function CustomerPaymentsPage({ params }: PageProps) {
  const session = await requireCustomer()
  const { userId } = await params
  if (userId !== session.user.id) notFound()

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-1.5">
          <h1 className="text-[26px] leading-tight font-semibold sm:text-[28px]">การชำระเงิน</h1>
          <p className="text-text-secondary max-w-2xl text-sm leading-relaxed">
            ดูรอบจ่ายเงิน · อัปโหลดหลักฐาน · ดาวน์โหลดใบแจ้งหนี้และสัญญา
          </p>
        </header>
        <CustomerPaymentPage customerId={userId} />
      </div>
    </DashboardLayout>
  )
}
