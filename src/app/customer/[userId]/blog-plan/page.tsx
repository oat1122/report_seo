import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireCustomer } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { Button } from '@/components/ui/button'
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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        <Button variant="ghost" size="sm" className="w-fit" asChild>
          <Link href="/customer">
            <ArrowLeft className="mr-1.5 size-4" />
            กลับหน้าหลัก
          </Link>
        </Button>
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">แผนบทความ</h1>
          <p className="text-muted-foreground text-sm">
            ทีมเขียนส่งงานมาที่นี่ · คุณอ่านแล้วกดอนุมัติหรือขอแก้ไข · ไฟล์ทุกเวอร์ชันเก็บไว้ให้ครบ
          </p>
        </header>
        <BlogPlanBoard customerId={userId} canManage={false} canRespond />
      </div>
    </DashboardLayout>
  )
}
