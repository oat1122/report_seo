'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { computeKeywordHeatmap } from '../lib/historyCalculations'
import { useHistoryContext } from '../contexts/HistoryContext'
import { ChartEmptyState } from '../components/ChartEmptyState'
import { ReportCard } from '../keywords/ReportCard'

interface KeywordPositionHeatmapProps {
  topN?: number
  weeks?: number
}

/** มือถือแสดงเฉพาะสัปดาห์ล่าสุด — ตารางต้องไม่ล้นจอ 390px */
const MOBILE_WEEKS = 6

type HeatLevel = 'top3' | 'top10' | 'top20' | 'mid' | 'far' | 'none'

const levelFor = (pos: number | null): HeatLevel => {
  if (pos == null || pos <= 0) return 'none'
  if (pos <= 3) return 'top3'
  if (pos <= 10) return 'top10'
  if (pos <= 20) return 'top20'
  if (pos <= 50) return 'mid'
  return 'far'
}

// สีช่วงอันดับ (UI Kit Data viz 05) — ตัวเลขในช่องเป็นสีเข้มทุกระดับ (light = foreground, dark = ตัวเข้มบนม่วง) contrast ≥ 4.5:1
const LEVEL_CLASS: Record<HeatLevel, string> = {
  top3: 'bg-secondary text-secondary-foreground',
  top10: 'bg-info text-foreground dark:text-background',
  top20: 'bg-accent text-foreground dark:text-background',
  mid: 'bg-border text-foreground',
  far: 'bg-muted text-foreground ring-1 ring-inset ring-muted-foreground/30',
  none: 'bg-muted/40',
}

const LEGEND: { level: HeatLevel; label: string }[] = [
  { level: 'top3', label: 'Top 3' },
  { level: 'top10', label: 'Top 10' },
  { level: 'top20', label: 'Top 20' },
  { level: 'mid', label: '21–50' },
  { level: 'far', label: '50+' },
]

const fmtWeek = (ms: number) =>
  new Date(ms).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
const fmtDay = (ms: number) => String(new Date(ms).getDate())

export const KeywordPositionHeatmap = ({ topN = 10, weeks = 12 }: KeywordPositionHeatmapProps) => {
  const { keywordHistory, currentKeywords } = useHistoryContext()

  const heatmap = useMemo(
    () => computeKeywordHeatmap(keywordHistory, currentKeywords, topN, weeks),
    [keywordHistory, currentKeywords, topN, weeks],
  )

  const hasData = heatmap.rows.some((r) => r.cells.some((c) => c.position != null))
  const lastIdx = heatmap.weeks.length - 1
  const firstMobileIdx = heatmap.weeks.length - MOBILE_WEEKS
  const inTop10 = heatmap.rows.filter(
    (r) => r.currentPosition != null && r.currentPosition <= 10,
  ).length

  return (
    <ReportCard
      title="Position Heatmap"
      description={
        <>
          Top {heatmap.rows.length} keywords ×{' '}
          <span className="md:hidden">{Math.min(MOBILE_WEEKS, weeks)}</span>
          <span className="hidden md:inline">{weeks}</span> สัปดาห์ล่าสุด · ยิ่งเขียวยิ่งดี
          {hasData && (
            <>
              {' '}
              — ตอนนี้ติด Top 10 แล้ว{' '}
              <strong className="text-foreground font-semibold tabular-nums">
                {inTop10}
              </strong> จาก {heatmap.rows.length} คำ
            </>
          )}
        </>
      }
    >
      <ul
        aria-label="คำอธิบายสี"
        className="text-text-secondary flex flex-wrap gap-x-4 gap-y-1.5 text-xs"
      >
        {LEGEND.map((l) => (
          <li key={l.level} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn('size-2.5 rounded-[3px]', LEVEL_CLASS[l.level])}
            />
            {l.label}
          </li>
        ))}
      </ul>

      {!hasData ? (
        <ChartEmptyState message="ยังไม่มีประวัติ position ของ keyword" height="240px" />
      ) : (
        <table className="w-full table-fixed border-separate border-spacing-[3px] text-xs">
          <caption className="sr-only">อันดับรายสัปดาห์ของ keyword ที่มี traffic สูงสุด</caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="text-muted-foreground w-[104px] pr-1 pb-1 text-left text-[11px] font-normal md:w-[150px]"
              >
                Keyword
              </th>
              {heatmap.weeks.map((w, idx) => {
                const showDesktopLabel = idx % 4 === 0 || idx === lastIdx
                return (
                  <th
                    key={w.start}
                    scope="col"
                    className={cn(
                      'text-muted-foreground pb-1 text-[11px] font-normal whitespace-nowrap',
                      idx < firstMobileIdx && 'hidden md:table-cell',
                    )}
                  >
                    <span aria-hidden="true" className="md:hidden">
                      {fmtDay(w.start)}
                    </span>
                    <span aria-hidden="true" className="hidden md:inline">
                      {showDesktopLabel ? fmtWeek(w.start) : ''}
                    </span>
                    <span className="sr-only">สัปดาห์ {fmtWeek(w.start)}</span>
                  </th>
                )
              })}
              <th
                scope="col"
                className="text-muted-foreground w-11 pb-1 text-[11px] font-normal md:w-[50px]"
              >
                ตอนนี้
              </th>
            </tr>
          </thead>
          <tbody>
            {heatmap.rows.map((row) => (
              <tr key={row.reportId}>
                <th
                  scope="row"
                  className="truncate pr-1.5 text-left text-[13px] font-medium"
                  title={row.keyword}
                >
                  {row.keyword}
                </th>
                {row.cells.map((cell, idx) => (
                  <td
                    key={`${row.reportId}-${cell.weekStart}`}
                    title={`${row.keyword} · ${fmtWeek(cell.weekStart)}: ${
                      cell.position != null ? `#${cell.position}` : 'ไม่มีข้อมูล'
                    }`}
                    className={cn(
                      'h-[30px] rounded-md text-center text-[11px] tabular-nums md:h-[34px]',
                      LEVEL_CLASS[levelFor(cell.position)],
                      idx < firstMobileIdx && 'hidden md:table-cell',
                    )}
                  >
                    {cell.position ?? <span className="sr-only">ไม่มีข้อมูล</span>}
                  </td>
                ))}
                <td className="text-center text-[13px] font-semibold tabular-nums">
                  {row.currentPosition != null ? `#${row.currentPosition}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </ReportCard>
  )
}
