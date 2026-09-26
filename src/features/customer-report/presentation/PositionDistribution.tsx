'use client'

import { useMemo } from 'react'
import { useReducedMotion } from 'motion/react'
import { EASE_OUT, motion } from '@/components/motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useHistoryContext } from './contexts/HistoryContext'
import { useReportFilters } from './contexts/ReportFiltersContext'
import { ReportCardHeader } from './components/ReportCardHeader'
import {
  computePositionDistribution,
  computePreviousPositionDistribution,
  type PositionDistributionResult,
} from './lib/historyCalculations'

interface BucketConfig {
  key: keyof Omit<PositionDistributionResult, 'total'>
  label: string
  /** พื้นแถบ + ตัวเลขที่อ่านได้ทั้งสองธีม */
  className: string
}

const BUCKETS: BucketConfig[] = [
  { key: 'top3', label: 'อันดับ 1–3', className: 'bg-chart-4 text-secondary-foreground' },
  {
    key: 'top10',
    label: 'อันดับ 4–10',
    className: 'bg-chart-3 text-foreground dark:text-primary-foreground',
  },
  {
    key: 'top20',
    label: 'อันดับ 11–20',
    // dark: accent = #6c68e8 ได้แค่ ~4.2:1 กับตัวอักษรทั้งขาวและดำ → ใช้ info (#9592ff) + ตัวเข้ม 6.6:1
    className: 'bg-accent text-accent-foreground dark:bg-info dark:text-primary-foreground',
  },
  { key: 'beyond', label: 'อันดับ 21+', className: 'bg-muted-foreground/35 text-foreground' },
  {
    key: 'unranked',
    label: 'ไม่ติดอันดับ',
    className: 'bg-muted text-foreground shadow-[inset_0_0_0_1px_var(--border)]',
  },
]

interface PositionDistributionProps {
  className?: string
}

const StackedBar = ({
  dist,
  label,
  size,
}: {
  dist: PositionDistributionResult
  label: string
  size: 'lg' | 'sm'
}) => {
  const reduce = useReducedMotion()
  const visible = BUCKETS.filter((b) => dist[b.key] > 0)
  return (
    <motion.div
      role="img"
      aria-label={`${label}: ${BUCKETS.map((b) => `${b.label} ${dist[b.key]} คำ`).join(', ')}`}
      initial={{ clipPath: reduce ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
      animate={{ clipPath: 'inset(0 0% 0 0)' }}
      transition={{ duration: 0.8, ease: EASE_OUT }}
      className={cn(
        'flex',
        size === 'lg' ? 'h-8 gap-0.5 md:h-9 md:gap-[3px]' : 'h-4 gap-0.5 opacity-75 md:h-[22px]',
      )}
    >
      {visible.map((bucket, i) => {
        const count = dist[bucket.key]
        const pct = (count / dist.total) * 100
        const isFirst = i === 0
        const isLast = i === visible.length - 1
        return (
          <div
            key={bucket.key}
            title={`${bucket.label}: ${count} คำ (${pct.toFixed(0)}%)`}
            style={{ flex: `${count} 1 0px` }}
            className={cn(
              'flex min-w-0 items-center overflow-hidden tabular-nums',
              size === 'lg'
                ? 'rounded-[4px] pl-2 text-[13px] font-semibold md:pl-3 md:text-sm'
                : 'rounded-[3px] pl-2.5 text-xs',
              size === 'sm' && 'max-md:text-transparent',
              isFirst && (size === 'lg' ? 'rounded-l-[10px]' : 'rounded-l-lg'),
              isLast && (size === 'lg' ? 'rounded-r-[10px]' : 'rounded-r-lg'),
              bucket.className,
            )}
          >
            {pct >= 8 && count}
          </div>
        )
      })}
    </motion.div>
  )
}

/** "Keyword อยู่อันดับไหนบ้าง" — แถบซ้อน 100% ปัจจุบัน vs ช่วงก่อน + legend */
export const PositionDistribution = ({ className }: PositionDistributionProps) => {
  const { currentKeywords, keywordHistory } = useHistoryContext()
  const { period } = useReportFilters()
  const dist = useMemo(() => computePositionDistribution(currentKeywords), [currentKeywords])
  const prev = useMemo(
    () => computePreviousPositionDistribution(keywordHistory, currentKeywords, period),
    [keywordHistory, currentKeywords, period],
  )

  if (dist.total === 0) {
    return (
      <Card className={cn('min-w-0', className)}>
        <ReportCardHeader title="Keyword อยู่อันดับไหนบ้าง" />
        <CardContent>
          <p className="bg-glass-tile text-text-secondary rounded-[14px] px-4 py-8 text-center text-sm">
            ยังไม่มี Keyword ในรายงาน — เมื่อทีมเพิ่ม Keyword แล้ว การกระจายอันดับจะแสดงที่นี่
          </p>
        </CardContent>
      </Card>
    )
  }

  const firstPage = dist.top3 + dist.top10
  const firstPagePct = Math.round((firstPage / dist.total) * 100)
  const prevFirstPage = prev ? prev.top3 + prev.top10 : null
  const prevLabel = `${period} วันก่อน`

  const summary =
    prevFirstPage === null
      ? `ติดหน้าแรก Google ${firstPage} จาก ${dist.total} คำ`
      : prevFirstPage < firstPage
        ? `ติดหน้าแรก Google เพิ่มจาก ${prevFirstPage} เป็น ${firstPage} คำ`
        : prevFirstPage > firstPage
          ? `ติดหน้าแรก Google ลดจาก ${prevFirstPage} เหลือ ${firstPage} คำ`
          : `ติดหน้าแรก Google ${firstPage} คำ เท่ากับ ${prevLabel}`

  return (
    <Card className={cn('min-w-0', className)}>
      <ReportCardHeader
        title="Keyword อยู่อันดับไหนบ้าง"
        description={summary}
        action={
          <span className="text-text-secondary hidden text-[13px] sm:inline">
            ทั้งหมด {dist.total} คำ
          </span>
        }
      />
      <CardContent className="flex flex-col gap-4 md:gap-[18px]">
        <div className="grid grid-cols-1 items-center gap-2 pt-2.5 md:grid-cols-[72px_minmax(0,1fr)] md:gap-x-3.5 md:gap-y-2.5">
          <div aria-hidden className="hidden md:block" />
          {firstPage > 0 ? (
            <div
              aria-hidden
              style={{ width: `${(firstPage / dist.total) * 100}%` }}
              className="border-info-strong relative h-3.5 min-w-24 rounded-t-md border-[1.5px] border-b-0 md:h-[18px]"
            >
              <span className="bg-background absolute -top-[11px] left-1/2 -translate-x-1/2 rounded-full px-2 text-xs font-medium whitespace-nowrap">
                หน้าแรก Google · {firstPagePct}%
              </span>
            </div>
          ) : (
            <div aria-hidden />
          )}

          <span className="text-xs font-medium md:text-[13px]">ปัจจุบัน</span>
          <StackedBar dist={dist} label="ปัจจุบัน" size="lg" />

          {prev && (
            <>
              <span className="text-text-secondary mt-1 text-xs md:mt-0 md:text-[13px]">
                {prevLabel}
              </span>
              <StackedBar dist={prev} label={prevLabel} size="sm" />
            </>
          )}
        </div>

        <ul className="border-border flex flex-col border-t sm:grid sm:grid-cols-5 sm:gap-3 sm:pt-3.5">
          {BUCKETS.map((bucket) => {
            const count = dist[bucket.key]
            return (
              <li
                key={bucket.key}
                className={cn(
                  'border-border grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-b py-2.5 last:border-b-0 sm:flex sm:flex-col sm:items-start sm:gap-0.5 sm:border-b-0 sm:py-0',
                  count === 0 && 'opacity-60',
                )}
              >
                <span className="text-foreground sm:text-text-secondary flex items-center gap-2 text-[13px] sm:gap-1.5 sm:text-xs">
                  <span
                    aria-hidden
                    className={cn('size-2.5 shrink-0 rounded-[3px]', bucket.className)}
                  />
                  {bucket.label}
                </span>
                <span className="text-sm font-semibold tabular-nums sm:text-[15px]">
                  {count} คำ
                </span>
                {prev && (
                  <span className="text-text-secondary w-12 text-right text-xs tabular-nums sm:w-auto sm:text-left">
                    เดิม {prev[bucket.key]}
                  </span>
                )}
              </li>
            )
          })}
        </ul>

        {/* Screen reader fallback */}
        <table className="sr-only">
          <caption>การกระจายอันดับของ Keyword</caption>
          <thead>
            <tr>
              <th>ช่วงอันดับ</th>
              <th>ปัจจุบัน</th>
              {prev && <th>{prevLabel}</th>}
            </tr>
          </thead>
          <tbody>
            {BUCKETS.map((b) => (
              <tr key={b.key}>
                <td>{b.label}</td>
                <td>{dist[b.key]}</td>
                {prev && <td>{prev[b.key]}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
