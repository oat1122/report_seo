'use client'

import { useMemo } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { KeywordRankingsView } from '../widgets/KeywordRankingsView'
import { KeywordTrendChart } from '../KeywordTrendChart'
import { KeywordReportTable } from '../KeywordReportTable'
import { KdDistributionDonut } from '../widgets/KdDistributionDonut'
import { KdSuccessRateBar } from '../widgets/KdSuccessRateBar'
import { TopKeywordsByTrafficPie } from '../widgets/TopKeywordsByTrafficPie'
import { KeywordVelocityScatter } from '../widgets/KeywordVelocityScatter'
import { KeywordPositionHeatmap } from '../widgets/KeywordPositionHeatmap'
import { BracketTransitionsSankey } from '../widgets/BracketTransitionsSankey'
import { useHistoryContext } from '../contexts/HistoryContext'

// Tab 3: Keyword Performance — "อันดับแต่ละคำเท่าไหร่?"
// บนสุด = ranking รายคำ (ดูง่าย สำหรับ present), ข้อมูลเชิงลึกพับเก็บใน accordion
// keyword ทุกตัว source จาก currentKeywords (context) — single source ตาม rule 11
export const KeywordPerformanceTab = () => {
  const { currentKeywords } = useHistoryContext()

  const topKeywords = useMemo(() => currentKeywords.filter((k) => k.isTopReport), [currentKeywords])
  const otherKeywords = useMemo(
    () => currentKeywords.filter((k) => !k.isTopReport),
    [currentKeywords],
  )

  return (
    <div className="flex flex-col gap-6">
      <KeywordRankingsView />

      <Accordion type="single" collapsible>
        <AccordionItem value="advanced" className="border-border rounded-2xl border px-4">
          <AccordionTrigger className="text-base font-bold">
            ดูข้อมูลเชิงลึก (Advanced analytics)
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-6 pt-1">
              <KeywordTrendChart title="แนวโน้ม Keyword" />
              <KeywordPositionHeatmap />
              <div className="grid gap-4 md:grid-cols-3 md:gap-5">
                <KdDistributionDonut keywords={currentKeywords} />
                <KdSuccessRateBar keywords={currentKeywords} />
                <TopKeywordsByTrafficPie keywords={currentKeywords} />
              </div>
              <BracketTransitionsSankey />
              <KeywordVelocityScatter />
              <KeywordReportTable title="Top Keywords Report" keywords={topKeywords} />
              <KeywordReportTable title="Other Keywords" keywords={otherKeywords} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
