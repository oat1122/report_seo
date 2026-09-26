import { requireAdmin } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { CustomerWorkspaceHeader } from '@/features/users/presentation/components/workspace/CustomerWorkspaceHeader'
import { PaymentDashboard } from '@/features/payments/presentation/components/admin/PaymentDashboard'
import { PaymentSectionSwitch } from '@/features/payments/presentation/components/admin/PaymentSectionSwitch'

export const metadata = {
  title: 'การชำระเงิน · Admin',
}

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function AdminPaymentsPage({ params }: PageProps) {
  await requireAdmin()
  const { userId } = await params

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <CustomerWorkspaceHeader userId={userId} basePath="/admin" />
        <PaymentSectionSwitch customerId={userId} />
        <PaymentDashboard customerId={userId} />
      </div>
    </DashboardLayout>
  )
}
