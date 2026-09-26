'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { DeltaChip, deltaMeta } from '../components/DeltaChip'
import { MiniSparkline } from '../components/MiniSparkline'
import { ReportCardHeader } from '../components/ReportCardHeader'
import { computeSparklineTopN } from '../lib/historyCalculations'
import { formatCompact } from '../lib/formatters'
import { useHistoryContext } from '../contexts/HistoryContext'
import { useReportFilters } from '../contexts/ReportFiltersContext'

interface TopKeywordsSparklineGridProps {
  topN?: number
  className?: string
}

/** Keyword ที่นำ traffic มากสุด + เส้นแนวโน้มอันดับ (ขึ้น = ดีขึ้น) */
export const TopKeywordsSparklineGrid = ({
  topN = 8,
  className,
}: TopKeywordsSparklineGridProps) => {
  const { keywordHistory, currentKeywords } = useHistoryContext()
  const { period } = useReportFilters()

  const rows = useMemo(
    () => computeSparklineTopN(keywordHistory, currentKeywords, period, topN),
    [keywordHistory, currentKeywords, period, topN],
  )

  return (
    <Card className={cn('min-w-0', className)}>
      <ReportCardHeader
        title="Keyword ที่นำ traffic มากสุด"
        description={`${topN} คำที่ traffic สูงสุด · เส้นคือแนวโน้มอันดับ (ขึ้น = ดีขึ้น) · % เทียบ ${period} วันก่อน`}
      />
      <CardContent>
        {rows.length === 0 ? (
          <p className="bg-glass-tile text-text-secondary rounded-[14px] px-4 py-10 text-center text-sm">
            ยังไม่มี Keyword ที่มี traffic — จะแสดงเมื่อ Keyword เริ่มมีคนเข้าจาก Google
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {rows.map((row) => {
              const positions = row.positionSpark.map((p) => p.v)
              const meta = deltaMeta(row.delta)
              return (
                <li
                  key={row.reportId}
                  className="bg-glass-tile flex min-h-14 items-center gap-3 rounded-[14px] px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" title={row.keyword}>
                      {row.keyword}
                    </p>
                    <p className="text-text-secondary text-xs tabular-nums">
                      อันดับ {row.currentPosition ?? '—'} · {formatCompact(row.current)} คน
                    </p>
                  </div>
                  <MiniSparkline
                    data={positions}
                    color="var(--chart-1)"
                    invert
                    width={64}
                    height={28}
                    ariaLabel={`แนวโน้มอันดับของ ${row.keyword}`}
                  />
                  <span className="flex w-16 justify-end">
                    {row.deltaPct != null ? (
                      <DeltaChip direction={meta.direction} tone={meta.tone}>
                        {Math.abs(row.deltaPct).toFixed(0)}%
                      </DeltaChip>
                    ) : (
                      <span className="text-text-secondary text-xs">—</span>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
