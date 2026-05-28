'use client'

import { useSession } from 'next-auth/react'
import { Role } from '@/types/auth'
import { PlanList } from '@/features/work-progress/presentation/components/plan/PlanList'

interface WorkProgressTabProps {
  customerId: string
}

export const WorkProgressTab = ({ customerId }: WorkProgressTabProps) => {
  const { data: session } = useSession()
  const role = session?.user?.role

  const basePath =
    role === Role.ADMIN
      ? `/admin/customers/${customerId}/work-progress`
      : role === Role.SEO_DEV
        ? `/seo/customers/${customerId}/work-progress`
        : `/customer/${customerId}/work-progress`

  const readOnly = role !== Role.ADMIN && role !== Role.SEO_DEV

  return (
    <div className="flex flex-col gap-4">
      <PlanList userId={customerId} basePath={basePath} readOnly={readOnly} />
    </div>
  )
}
