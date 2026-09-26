import { notFound } from 'next/navigation'
import { requireCustomer } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { BlogPlanBoard } from '@/features/blog-plan/presentation/components/BlogPlanBoard'

export const metadata = {
  title: 'แผนบทความ | SEO Report',
}

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function CustomerBlogPlanPage({ params }: PageProps) {
  const session = await requireCustomer()
  const { userId } = await params
  if (userId !== session.user.id) notFound()

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-1.5">
          <h1 className="text-[26px] leading-tight font-semibold sm:text-[28px]">แผนบทความ</h1>
          <p className="text-text-secondary max-w-2xl text-sm leading-relaxed">
            ทีมเขียนส่งงานมาที่นี่ · คุณอ่านแล้วกดอนุมัติหรือขอแก้ไข · ไฟล์ทุกเวอร์ชันเก็บไว้ให้ครบ
          </p>
        </header>
        <BlogPlanBoard customerId={userId} canManage={false} canRespond />
      </div>
    </DashboardLayout>
  )
}
