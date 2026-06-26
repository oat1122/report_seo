'use client'

import { SummaryStatistics } from '../SummaryStatistics'
import { PositionDistribution } from '../PositionDistribution'
import { TopMovers } from '../TopMovers'
import { HeroStatusCard } from '../widgets/HeroStatusCard'
import { CoverageSnapshotCard } from '../widgets/CoverageSnapshotCard'
import { TrafficForecastCone } from '../widgets/TrafficForecastCone'
import { IntradayTrafficChart } from '../widgets/IntradayTrafficChart'
import { TopKeywordsSparklineGrid } from '../widgets/TopKeywordsSparklineGrid'
import { NextStepsCard } from '@/features/next-steps/presentation/components/NextStepsCard'

interface OverviewTabProps {
  customerId: string
  recommendationsCount: number
}

// Tab 1: Overview — "ดีขึ้นไหม? คุ้มไหม?"
export const OverviewTab = ({ customerId, recommendationsCount }: OverviewTabProps) => {
  return (
    <div className="flex flex-col gap-6">
      <NextStepsCard customerId={customerId} />

      <HeroStatusCard />

      <CoverageSnapshotCard />

      <SummaryStatistics recommendationsCount={recommendationsCount} />

      <TrafficForecastCone />

      <IntradayTrafficChart />

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
