'use client'

import dynamic from 'next/dynamic'
import { useCustomerHub } from '../hooks/useCustomerHub'
import { CustomerDashboardWidget } from '@/features/work-progress/presentation/components/summary/CustomerDashboardWidget'
import { CustomerHubHero } from './CustomerHubHero'
import { CustomerStatsRow } from './CustomerStatsRow'
import { CustomerNotificationsPanel } from './CustomerNotificationsPanel'
import { CustomerQuickNav } from './CustomerQuickNav'
import { Skeleton } from '@/components/ui/skeleton'

const CustomerCalendar = dynamic(
  () => import('./calendar/CustomerCalendar').then((m) => m.CustomerCalendar),
  { ssr: false, loading: () => <Skeleton className="h-[550px] w-full rounded-xl" /> },
)

interface CustomerHubClientProps {
  userId: string
  userName: string
}

export function CustomerHubClient({ userId, userName }: CustomerHubClientProps) {
  const { data, isLoading } = useCustomerHub()

  return (
    <div className="space-y-6">
      <CustomerHubHero userName={userName} />

      <CustomerStatsRow metrics={data?.metrics} isLoading={isLoading} />

      <CustomerCalendar userId={userId} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CustomerDashboardWidget userId={userId} />
        </div>

        <div className="space-y-4">
          <CustomerNotificationsPanel />
          <CustomerQuickNav userId={userId} />
        </div>
      </div>
    </div>
  )
}
