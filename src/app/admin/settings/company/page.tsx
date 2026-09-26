import { requireAdmin } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { CompanySettingsForm } from '@/features/company-settings/presentation/components/CompanySettingsForm'

export const metadata = {
  title: 'ตั้งค่าข้อมูลบริษัท · Admin',
}

export default async function CompanySettingsPage() {
  await requireAdmin()
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <header className="flex min-w-0 flex-col gap-1.5">
          <h1 className="text-[26px] leading-tight font-semibold md:text-[28px]">
            ตั้งค่าข้อมูลบริษัท
          </h1>
          <p className="text-text-secondary text-[13px] md:text-sm">
            ข้อมูลบริษัทสำหรับออกเอกสาร PDF
          </p>
        </header>
        <CompanySettingsForm />
      </div>
    </DashboardLayout>
  )
}
