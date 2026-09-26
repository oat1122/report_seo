import { requireAdmin } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { CustomerWorkspaceHeader } from '@/features/users/presentation/components/workspace/CustomerWorkspaceHeader'
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
      <div className="flex flex-col gap-5">
        <CustomerWorkspaceHeader userId={userId} basePath="/admin" />
        <BlogSettingsCard customerId={userId} />
        <BlogPlanBoard customerId={userId} canManage canRespond />
      </div>
    </DashboardLayout>
  )
}
