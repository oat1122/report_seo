'use client'

import { useCustomerHub } from '../hooks/useCustomerHub'
import { useHubSchedule } from '../hooks/useHubSchedule'
import { ReportRoiHighlight } from '@/features/customer-report/presentation/embeds/ReportRoiHighlight'
import { NextStepsCard } from '@/features/next-steps/presentation/components/NextStepsCard'
import { CustomerHubHero } from './CustomerHubHero'
import { CustomerStatsRow } from './CustomerStatsRow'
import { CustomerAgendaPanel } from './CustomerAgendaPanel'
import { CustomerNotificationsPanel } from './CustomerNotificationsPanel'
import { CustomerQuickNav } from './CustomerQuickNav'

interface CustomerHubClientProps {
  userId: string
  userName: string
}

export function CustomerHubClient({ userId, userName }: CustomerHubClientProps) {
  const { data, isLoading } = useCustomerHub()
  const schedule = useHubSchedule(userId)
  const name = userName || data?.customerName || ''

  return (
    <div className="space-y-6">
      <CustomerHubHero userName={name} domain={data?.domain} />

      <CustomerStatsRow metrics={data?.metrics} isLoading={isLoading} />

      <div className="grid gap-[18px] lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-[18px]">
          <ReportRoiHighlight customerId={userId} />
          <NextStepsCard customerId={userId} limit={3} />
          <CustomerAgendaPanel
            userId={userId}
            events={schedule.events}
            itemLookup={schedule.itemLookup}
            isLoading={schedule.isLoading}
          />
        </div>

        <div className="flex flex-col gap-[18px]">
          <CustomerNotificationsPanel />
          <CustomerQuickNav userId={userId} />
        </div>
      </div>
    </div>
  )
}
