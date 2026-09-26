'use client'

import { useId, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { EASE_OUT, motion } from '@/components/motion'
import { cn } from '@/lib/utils'
import { KeywordRankingsView } from '../widgets/KeywordRankingsView'
import { KeywordTrendChart } from '../KeywordTrendChart'
import { KeywordReportTable } from '../KeywordReportTable'
import { KdDistributionDonut } from '../widgets/KdDistributionDonut'
import { KdSuccessRateBar } from '../widgets/KdSuccessRateBar'
import { TopKeywordsByTrafficPie } from '../widgets/TopKeywordsByTrafficPie'
import { KeywordVelocityScatter } from '../widgets/KeywordVelocityScatter'
import { KeywordPositionHeatmap } from '../widgets/KeywordPositionHeatmap'
import { BracketTransitionsSankey } from '../widgets/BracketTransitionsSankey'
import { KeywordSummaryTable } from '../keywords/KeywordSummaryTable'
import { useHistoryContext } from '../contexts/HistoryContext'

// Tab 3: Keyword Performance — "อันดับแต่ละคำเท่าไหร่?"
// บนสุด = ranking รายคำ + heatmap/KD (ดูง่าย สำหรับ present), ข้อมูลเชิงลึกพับเก็บ
// keyword ทุกตัว source จาก currentKeywords (context) — single source ตาม rule 11
export const KeywordPerformanceTab = () => {
  const { currentKeywords } = useHistoryContext()
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const advancedId = useId()

  const topKeywords = useMemo(() => currentKeywords.filter((k) => k.isTopReport), [currentKeywords])
  const otherKeywords = useMemo(
    () => currentKeywords.filter((k) => !k.isTopReport),
    [currentKeywords],
  )

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <KeywordRankingsView />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-[18px]">
        <KeywordPositionHeatmap />
        <div className="flex min-w-0 flex-col gap-4 lg:gap-[18px]">
          <KdSuccessRateBar keywords={currentKeywords} />
          <KdDistributionDonut keywords={currentKeywords} />
        </div>
      </div>

      <div className="flex flex-col gap-4 md:gap-5">
        <button
          type="button"
          aria-expanded={advancedOpen}
          aria-controls={advancedOpen ? advancedId : undefined}
          onClick={() => setAdvancedOpen((v) => !v)}
          className="border-glass-border hover:bg-glass-tile focus-visible:ring-ring/70 flex w-full items-center justify-between gap-4 rounded-[18px] border bg-white/55 p-4 text-left transition-colors outline-none focus-visible:ring-[3px] md:px-[22px] md:py-[18px] dark:bg-white/5"
        >
          <span className="flex min-w-0 flex-col gap-1">
            <span className="text-base font-semibold">ดูข้อมูลเชิงลึก (Advanced analytics)</span>
            <span className="text-text-secondary text-[13px]">
              แนวโน้มราย Keyword · Bracket Transitions · Keyword Velocity · Top 5 by Traffic ·
              ตารางสรุปทั้งหมด
            </span>
          </span>
          <span
            aria-hidden="true"
            className={cn(
              'border-border flex size-10 shrink-0 items-center justify-center rounded-full border bg-white transition-transform duration-200 ease-out motion-reduce:transition-none dark:bg-white/10',
              advancedOpen && 'bg-info-subtle rotate-180 border-transparent',
            )}
          >
            <ChevronDown className="size-4" />
          </span>
        </button>

        {advancedOpen && (
          <motion.div
            id={advancedId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, ease: EASE_OUT }}
            className="flex flex-col gap-4 md:gap-5"
          >
            <KeywordTrendChart title="แนวโน้มราย Keyword" />
            <BracketTransitionsSankey />
            <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-[18px]">
              <KeywordVelocityScatter />
              <TopKeywordsByTrafficPie keywords={currentKeywords} />
            </div>
            <KeywordSummaryTable />
            <KeywordReportTable title="Top Keywords Report" keywords={topKeywords} />
            <KeywordReportTable title="Other Keywords" keywords={otherKeywords} />
          </motion.div>
        )}
      </div>
    </div>
  )
}
