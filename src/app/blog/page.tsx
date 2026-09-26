import { requireBlogWriter } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { AssignedCustomerList } from '@/features/blog-plan/presentation/components/writer/AssignedCustomerList'

export const metadata = {
  title: 'แผนบทความ | SEO Report',
}

export default async function BlogWriterHomePage() {
  await requireBlogWriter()

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-1.5">
          <h1 className="text-[26px] leading-tight font-semibold sm:text-[28px]">ลูกค้าที่ดูแล</h1>
          <p className="text-text-secondary max-w-2xl text-sm leading-relaxed">
            เลือกลูกค้าเพื่อดู keyword และจัดการแผนบทความรายเดือน
          </p>
        </header>
        <AssignedCustomerList />
      </div>
    </DashboardLayout>
  )
}
