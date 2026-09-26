import { requireAdmin } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { AdminDocumentManager } from '@/features/billing-documents/presentation/components/admin/AdminDocumentManager'

export const metadata = { title: 'จัดการเอกสาร · Admin' }

export default async function AdminDocumentsPage() {
  await requireAdmin()

  return (
    <DashboardLayout>
      <AdminDocumentManager />
    </DashboardLayout>
  )
}
