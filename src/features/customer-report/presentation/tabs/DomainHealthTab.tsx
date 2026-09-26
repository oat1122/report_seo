'use client'

import { OverallMetricsCard } from '../OverallMetricsCard'
import { TrendChartsSection } from '../TrendChartsSection'
import { DomainHealthStatus } from '../components/DomainHealthStatus'
import { DomainAuthorityRadar } from '../widgets/DomainAuthorityRadar'
import { SpamScoreTimeline } from '../widgets/SpamScoreTimeline'
import { BacklinksVsRefDomains } from '../widgets/BacklinksVsRefDomains'
import { DomainLifecycleCard } from '../widgets/DomainLifecycleCard'
import type { CustomerReportData } from '@/hooks/api/useCustomersApi'

interface DomainHealthTabProps {
  customerId: string
  customerName: string
  metrics: CustomerReportData['metrics'] | null | undefined
}

// Tab 2: Domain Health — "เว็บสุขภาพดีไหม?"
// Desktop (DomainHealth.dc.html): สถานะ → radar 5fr | metrics + lifecycle 7fr → spam | backlinks → trend
// Mobile (DomainHealth-Mobile.dc.html): สถานะ → metrics → radar → lifecycle → spam → backlinks → trend
export const DomainHealthTab = ({ customerId, customerName, metrics }: DomainHealthTabProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:gap-[18px] xl:grid-cols-12">
      {metrics && <DomainHealthStatus metrics={metrics} className="order-1 xl:col-span-12" />}

      <DomainAuthorityRadar className="order-3 xl:order-2 xl:col-span-5" />

      {/* มือถือ: contents → ลูกเรียงแทรก radar ได้ · xl: คอลัมน์ขวาซ้อนกัน */}
      <div className="contents xl:order-3 xl:col-span-7 xl:flex xl:min-w-0 xl:flex-col xl:gap-[18px]">
        <div className="order-2 min-w-0">
          <OverallMetricsCard
            metrics={metrics ?? null}
            customerId={customerId}
            customerName={customerName}
          />
        </div>
        <DomainLifecycleCard metrics={metrics} className="order-4" />
      </div>

      <SpamScoreTimeline className="order-5 xl:col-span-6" />

      <BacklinksVsRefDomains className="order-6 xl:col-span-6" />

      <TrendChartsSection title="แนวโน้ม Domain Metrics" className="order-7 xl:col-span-12" />
    </div>
  )
}
