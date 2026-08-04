import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireBlogWriter } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { BlogPlanBoard } from '@/features/blog-plan/presentation/components/BlogPlanBoard'

export const metadata = {
  title: 'เขียนบทความ | SEO Report',
}

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function BlogWriterWorkspacePage({ params }: PageProps) {
  await requireBlogWriter()
  const { userId } = await params

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        <Button variant="ghost" size="sm" className="w-fit" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-1.5 size-4" />
            กลับรายชื่อลูกค้า
          </Link>
        </Button>
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">แผนบทความ</h1>
          <p className="text-muted-foreground text-sm">
            เลือก keyword · เสนอหัวข้อ · อัปโหลดไฟล์บทความและภาพปก
          </p>
        </header>
        <BlogPlanBoard customerId={userId} canManage canRespond={false} />
      </div>
    </DashboardLayout>
  )
}
