import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { requireAdmin } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { TemplateList } from '@/features/work-progress/presentation/components/template/TemplateList'

export const metadata = {
  title: 'Work Progress · Templates · Admin',
}

export default async function TemplateListPage() {
  await requireAdmin()
  return (
    <DashboardLayout>
      <div className="flex w-full min-w-0 flex-col gap-5">
        <header className="flex min-w-0 flex-col gap-1.5">
          <Link
            href="/admin/settings/work-progress?tab=templates"
            className="text-text-secondary hover:text-foreground focus-visible:ring-ring/60 inline-flex min-h-11 items-center gap-1 self-start rounded-lg text-[13px] outline-none focus-visible:ring-2 md:min-h-7"
          >
            <ChevronLeft className="size-4" aria-hidden />
            ตั้งค่า Work Progress
          </Link>
          <h1 className="text-[26px] leading-tight font-semibold md:text-[28px]">Templates</h1>
          <p className="text-text-secondary text-sm">
            Template ใช้สร้างแผนใหม่แบบ 1-click พร้อม items ที่กำหนดล่วงหน้า
          </p>
        </header>
        <TemplateList basePath="/admin/settings/work-progress/templates" />
      </div>
    </DashboardLayout>
  )
}
