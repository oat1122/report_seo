import { requireAdmin } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { AdminHubClient } from '@/features/admin-hub/presentation/components/AdminHubClient'

export default async function AdminDashboard() {
  await requireAdmin()

  return (
    <DashboardLayout>
      <AdminHubClient />
    </DashboardLayout>
  )
}
