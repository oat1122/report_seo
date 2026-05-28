import { requireAdmin } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { BackButton } from '@/components/shared/BackButton'
import { AdminDocumentManager } from '@/features/billing-documents/presentation/components/admin/AdminDocumentManager'

export const metadata = { title: 'จัดการเอกสาร · Admin' }

export default async function AdminDocumentsPage() {
  await requireAdmin()

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">จัดการเอกสาร</h1>
            <p className="text-muted-foreground text-sm">ดูและจัดการเอกสาร PDF ของลูกค้าทุกราย</p>
          </header>
        </div>
        <AdminDocumentManager />
      </div>
    </DashboardLayout>
  )
}
