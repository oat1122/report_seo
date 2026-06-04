'use client'

import { useMemo } from 'react'
import { computeKeywordHeatmap } from '../lib/historyCalculations'
import { useHistoryContext } from '../contexts/HistoryContext'

interface KeywordPositionHeatmapProps {
  topN?: number
  weeks?: number
}

/**
 * Map position → color intensity using --success token.
 * Top 3 = darkest, 4-10 = mid, 11-20 = light, 21+ = pale, null = neutral.
 * Encoding via Tailwind opacity tokens that auto-flip dark mode.
 */
const cellClass = (pos: number | null): string => {
  if (pos == null || pos <= 0) return 'bg-muted/30'
  if (pos <= 3) return 'bg-success'
  if (pos <= 10) return 'bg-success/70'
  if (pos <= 20) return 'bg-warning/60'
  if (pos <= 50) return 'bg-destructive/40'
  return 'bg-destructive/60'
}

const cellLabel = (pos: number | null): string => {
  if (pos == null || pos <= 0) return 'ไม่มีข้อมูล'
  return `#${pos}`
}

export const KeywordPositionHeatmap = ({ topN = 10, weeks = 12 }: KeywordPositionHeatmapProps) => {
  const { keywordHistory, currentKeywords } = useHistoryContext()

  const heatmap = useMemo(
    () => computeKeywordHeatmap(keywordHistory, currentKeywords, topN, weeks),
    [keywordHistory, currentKeywords, topN, weeks],
  )

  const hasData = heatmap.rows.some((r) => r.cells.some((c) => c.position != null))

  return (
    <div className="border-border rounded-2xl border p-4 md:p-6">
      <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-xl font-bold">Position Heatmap</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            Top {topN} keywords × {weeks} สัปดาห์ล่าสุด · เขียวเข้ม = Top 3
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="bg-success size-3 rounded-sm" />
            Top 3
          </span>
          <span className="flex items-center gap-1">
            <span className="bg-success/70 size-3 rounded-sm" />
            Top 10
          </span>
          <span className="flex items-center gap-1">
            <span className="bg-warning/60 size-3 rounded-sm" />
            Top 20
          </span>
          <span className="flex items-center gap-1">
            <span className="bg-destructive/60 size-3 rounded-sm" />
            21+
          </span>
        </div>
      </div>

      {!hasData ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          ยังไม่มีประวัติ position ของ keyword
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0.5">
            <thead>
              <tr>
                <th className="bg-background text-muted-foreground sticky left-0 z-10 pr-2 text-left text-xs font-semibold">
                  Keyword
                </th>
                {heatmap.weeks.map((w) => (
                  <th
                    key={w.start}
                    className="text-muted-foreground px-0.5 text-center text-[10px] font-normal"
                  >
                    {w.label}
                  </th>
                ))}
                <th className="text-muted-foreground pl-2 text-center text-xs font-semibold">
                  Now
                </th>
              </tr>
            </thead>
            <tbody>
              {heatmap.rows.map((row) => (
                <tr key={row.reportId}>
                  <td
                    className="bg-background sticky left-0 z-10 max-w-[140px] truncate pr-2 text-xs font-medium"
                    title={row.keyword}
                  >
                    {row.keyword}
                  </td>
                  {row.cells.map((cell, idx) => (
                    <td
                      key={`${row.reportId}-${idx}`}
                      className="p-0"
                      title={`${row.keyword} — ${cellLabel(cell.position)}`}
                    >
                      <div
                        className={`mx-auto h-6 w-full rounded-sm transition-opacity hover:opacity-80 ${cellClass(cell.position)}`}
                        role="cell"
                        aria-label={`${row.keyword} ${cellLabel(cell.position)}`}
                      />
                    </td>
                  ))}
                  <td className="pl-2 text-center text-xs font-bold tabular-nums">
                    {row.currentPosition != null ? `#${row.currentPosition}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
