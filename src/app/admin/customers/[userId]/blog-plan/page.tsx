import { requireAdmin } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { BackButton } from '@/components/shared/BackButton'
import { BlogSettingsCard } from '@/features/blog-plan/presentation/components/admin/BlogSettingsCard'
import { BlogPlanBoard } from '@/features/blog-plan/presentation/components/BlogPlanBoard'

export const metadata = {
  title: 'แผนบทความ · Admin',
}

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function AdminBlogPlanPage({ params }: PageProps) {
  await requireAdmin()
  const { userId } = await params

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">แผนบทความ</h1>
            <p className="text-muted-foreground text-sm">
              ตั้งโควตาต่อเดือน · มอบหมายผู้เขียน · ติดตามทั้ง 7 ขั้นตอนของแต่ละบทความ
            </p>
          </header>
        </div>
        <BlogSettingsCard customerId={userId} />
        <BlogPlanBoard customerId={userId} canManage canRespond />
      </div>
    </DashboardLayout>
  )
}
