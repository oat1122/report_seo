import { requireAdmin } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { WorkProgressSettingsTabs } from '@/features/work-progress/presentation/components/WorkProgressSettingsTabs'

export const metadata = {
  title: 'ตั้งค่า Work Progress · Admin',
}

export default async function WorkProgressSettingsPage() {
  await requireAdmin()
  return (
    <DashboardLayout>
      <WorkProgressSettingsTabs />
    </DashboardLayout>
  )
}
