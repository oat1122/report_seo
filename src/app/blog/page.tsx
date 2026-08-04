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
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">ลูกค้าที่ดูแล</h1>
          <p className="text-muted-foreground text-sm">
            เลือกลูกค้าเพื่อดู keyword และจัดการแผนบทความรายเดือน
          </p>
        </header>
        <AssignedCustomerList />
      </div>
    </DashboardLayout>
  )
}
