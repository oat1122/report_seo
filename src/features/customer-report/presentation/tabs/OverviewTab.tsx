'use client'

import Link from 'next/link'
import { ChevronRight, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SummaryStatistics } from '../SummaryStatistics'
import { PositionDistribution } from '../PositionDistribution'
import { TopMovers } from '../TopMovers'
import { CoverageSnapshotCard } from '../widgets/CoverageSnapshotCard'
import { TrafficForecastCone } from '../widgets/TrafficForecastCone'
import { IntradayTrafficChart } from '../widgets/IntradayTrafficChart'
import { TopKeywordsSparklineGrid } from '../widgets/TopKeywordsSparklineGrid'
import { useReportTabHref } from '../hooks/useReportTabHref'
import { NextStepsCard } from '@/features/next-steps/presentation/components/NextStepsCard'

interface OverviewTabProps {
  customerId: string
  recommendationsCount: number
}

// Tab 1: Overview — "ดีขึ้นไหม? คุ้มไหม?"
// Desktop (Main.dc.html): KPI 4 ใบ → traffic 2fr + movers 1fr → distribution 2fr + next steps 1fr
// Mobile (Mobile.dc.html): traffic ก่อน → KPI 2×2 → distribution → movers → next steps
export const OverviewTab = ({ customerId, recommendationsCount }: OverviewTabProps) => {
  const tabHref = useReportTabHref()

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-[18px] xl:grid-cols-3">
      <SummaryStatistics className="order-2 md:order-1 xl:col-span-3" />

      <TrafficForecastCone className="order-1 md:order-2 xl:col-span-2" />

      <TopMovers className="order-4 md:order-3" />

      <PositionDistribution className="order-3 md:order-4 xl:col-span-2" />

      <NextStepsCard customerId={customerId} showEmpty className="order-5" />

      <CoverageSnapshotCard
        className="order-6 xl:col-span-3"
        action={
          recommendationsCount > 0 ? (
            <Button asChild variant="soft" className="w-full rounded-full md:h-9 md:w-auto">
              <Link href={tabHref('ai')} replace>
                <Lightbulb aria-hidden className="text-info-strong" />
                Keyword ที่แนะนำ {recommendationsCount} คำ
                <ChevronRight aria-hidden />
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="order-7 grid grid-cols-1 gap-4 md:gap-[18px] xl:col-span-3 xl:grid-cols-2">
        <TopKeywordsSparklineGrid />
        <IntradayTrafficChart />
      </div>
    </div>
  )
}
