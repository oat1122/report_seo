'use client'

import { SummaryStatistics } from '../SummaryStatistics'
import { PositionDistribution } from '../PositionDistribution'
import { TopMovers } from '../TopMovers'
import { HeroStatusCard } from '../widgets/HeroStatusCard'
import { CoverageSnapshotCard } from '../widgets/CoverageSnapshotCard'
import { TrafficForecastCone } from '../widgets/TrafficForecastCone'
import { TopKeywordsSparklineGrid } from '../widgets/TopKeywordsSparklineGrid'
import type { CustomerReportData } from '@/hooks/api/useCustomersApi'

interface OverviewTabProps {
  recommendationsCount: number
  topKeywords: CustomerReportData['topKeywords']
  otherKeywords: CustomerReportData['otherKeywords']
  currentTraffic?: number | null
}

// Tab 1: Overview — "ดีขึ้นไหม? คุ้มไหม?"
export const OverviewTab = ({
  recommendationsCount,
  topKeywords,
  otherKeywords,
  currentTraffic,
}: OverviewTabProps) => {
  return (
    <div className="flex flex-col gap-6">
      <HeroStatusCard />

      <CoverageSnapshotCard topKeywords={topKeywords ?? []} otherKeywords={otherKeywords ?? []} />

      <SummaryStatistics recommendationsCount={recommendationsCount} />

      <TrafficForecastCone currentTraffic={currentTraffic} />

      <TopKeywordsSparklineGrid />

      <div className="grid gap-4 md:grid-cols-12 md:gap-5">
        <div className="md:col-span-7">
          <PositionDistribution className="h-full" />
        </div>
        <div className="md:col-span-5">
          <TopMovers className="h-full" />
        </div>
      </div>
    </div>
  )
}
