import { requireAdmin } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { TemplateBuilder } from '@/features/work-progress/presentation/components/template/TemplateBuilder'

export const metadata = {
  title: 'Work Progress · Template · Admin',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TemplateBuilderPage({ params }: PageProps) {
  await requireAdmin()
  const { id } = await params
  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-5xl">
        <TemplateBuilder templateId={id} backHref="/admin/settings/work-progress?tab=templates" />
      </div>
    </DashboardLayout>
  )
}
