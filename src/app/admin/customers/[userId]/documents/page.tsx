import { requireAdmin } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { BackButton } from '@/components/shared/BackButton'
import { DocumentList } from '@/features/billing-documents/presentation/components/admin/DocumentList'

export const metadata = {
  title: 'เอกสาร · Admin',
}

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function AdminDocumentsPage({ params }: PageProps) {
  await requireAdmin()
  const { userId } = await params

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">เอกสารการเงิน</h1>
            <p className="text-muted-foreground text-sm">
              สร้าง PDF ใบวางบิล · ใบแจ้งหนี้ · ใบเสร็จ · ใบกำกับภาษี
            </p>
          </header>
        </div>
        <DocumentList customerId={userId} />
      </div>
    </DashboardLayout>
  )
}
