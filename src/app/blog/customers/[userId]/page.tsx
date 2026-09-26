import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { requireBlogWriter } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
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
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-3">
          <nav
            aria-label="breadcrumb"
            className="text-text-secondary flex items-center gap-1.5 text-[13px]"
          >
            <Link href="/blog" className="hover:text-foreground">
              ลูกค้าที่ดูแล
            </Link>
            <ChevronRight aria-hidden className="size-3.5" />
            <span className="text-foreground font-medium">แผนบทความ</span>
          </nav>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[26px] leading-tight font-semibold sm:text-[28px]">แผนบทความ</h1>
            <p className="text-text-secondary max-w-2xl text-sm leading-relaxed">
              เลือก keyword · เสนอหัวข้อ · อัปโหลดไฟล์บทความและภาพปก
            </p>
          </div>
        </header>
        <BlogPlanBoard customerId={userId} canManage canRespond={false} />
      </div>
    </DashboardLayout>
  )
}
