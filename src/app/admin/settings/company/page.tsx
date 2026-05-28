import { requireAdmin } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { BackButton } from '@/components/shared/BackButton'
import { CompanySettingsForm } from '@/features/company-settings/presentation/components/CompanySettingsForm'

export const metadata = {
  title: 'ตั้งค่าข้อมูลบริษัท · Admin',
}

export default async function CompanySettingsPage() {
  await requireAdmin()
  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">ตั้งค่าข้อมูลบริษัท</h1>
            <p className="text-muted-foreground text-sm">ข้อมูลบริษัทสำหรับออกเอกสาร PDF</p>
          </header>
        </div>
        <CompanySettingsForm />
      </div>
    </DashboardLayout>
  )
}
