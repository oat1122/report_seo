'use client'

import { useMemo } from 'react'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { MiniSparkline } from '../components/MiniSparkline'
import { ReportIcon } from '../components/ReportIcon'
import { computeSparklineTopN } from '../lib/historyCalculations'
import { useHistoryContext } from '../contexts/HistoryContext'
import { useReportFilters } from '../contexts/ReportFiltersContext'

interface TopKeywordsSparklineGridProps {
  topN?: number
}

const fmtTraffic = (v: number): string => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return v.toFixed(0)
}

export const TopKeywordsSparklineGrid = ({ topN = 8 }: TopKeywordsSparklineGridProps) => {
  const { keywordHistory, currentKeywords } = useHistoryContext()
  const { period } = useReportFilters()

  const rows = useMemo(
    () => computeSparklineTopN(keywordHistory, currentKeywords, period, topN),
    [keywordHistory, currentKeywords, period, topN],
  )

  return (
    <div className="border-border rounded-2xl border p-4 md:p-6">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-xl font-bold">
          <ReportIcon name="trending-up" trigger="hover" color="bg-info" />
          Top Keywords Snapshot
        </h3>
        <p className="text-muted-foreground mt-1 text-xs">
          {topN} keywords อันดับ traffic สูงสุด · trend ของ position
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          ยังไม่มี keyword ที่มี traffic
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
          {rows.map((row) => {
            const positions = row.positionSpark.map((p) => p.v)
            const DeltaIcon = row.delta > 0 ? ArrowUp : row.delta < 0 ? ArrowDown : Minus
            const deltaClass =
              row.delta > 0
                ? 'text-success'
                : row.delta < 0
                  ? 'text-destructive'
                  : 'text-muted-foreground'
            return (
              <div
                key={row.reportId}
                className="border-border bg-card hover:bg-muted flex items-center gap-3 rounded-lg border p-2.5 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" title={row.keyword}>
                    {row.keyword}
                  </p>
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <span>
                      #{row.currentPosition ?? '—'} · {fmtTraffic(row.current)}
                    </span>
                  </div>
                </div>
                <MiniSparkline
                  data={positions}
                  color="var(--info)"
                  invert
                  width={72}
                  height={28}
                  ariaLabel={`${row.keyword} position trend`}
                />
                <div
                  className={`flex w-14 items-center justify-end gap-0.5 text-xs font-semibold tabular-nums ${deltaClass}`}
                >
                  <DeltaIcon className="size-3" />
                  {row.deltaPct != null ? `${Math.abs(row.deltaPct).toFixed(0)}%` : '—'}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
