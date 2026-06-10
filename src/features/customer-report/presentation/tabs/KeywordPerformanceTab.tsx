'use client'

import { useMemo } from 'react'
import { KeywordTrendChart } from '../KeywordTrendChart'
import { KeywordReportTable } from '../KeywordReportTable'
import { KdDistributionDonut } from '../widgets/KdDistributionDonut'
import { KdSuccessRateBar } from '../widgets/KdSuccessRateBar'
import { TopKeywordsByTrafficPie } from '../widgets/TopKeywordsByTrafficPie'
import { KeywordVelocityScatter } from '../widgets/KeywordVelocityScatter'
import { KeywordPositionHeatmap } from '../widgets/KeywordPositionHeatmap'
import { BracketTransitionsSankey } from '../widgets/BracketTransitionsSankey'
import { useHistoryContext } from '../contexts/HistoryContext'

// Tab 3: Keyword Performance — "อะไรเด่น/ตก?"
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
      {/* Row 1: hero chart */}
      <KeywordTrendChart title="แนวโน้ม Keyword" />

      {/* Row 2: heatmap (full width) */}
      <KeywordPositionHeatmap />

      {/* Row 3: 3-up insight grid */}
      <div className="grid gap-4 md:grid-cols-3 md:gap-5">
        <KdDistributionDonut keywords={currentKeywords} />
        <KdSuccessRateBar keywords={currentKeywords} />
        <TopKeywordsByTrafficPie keywords={currentKeywords} />
      </div>

      {/* Row 4: bracket transitions sankey */}
      <BracketTransitionsSankey />

      {/* Row 5: scatter */}
      <KeywordVelocityScatter />

      {/* Row 6-7: tables */}
      <KeywordReportTable title="Top Keywords Report" keywords={topKeywords} />
      <KeywordReportTable title="Other Keywords" keywords={otherKeywords} />
    </div>
  )
}
