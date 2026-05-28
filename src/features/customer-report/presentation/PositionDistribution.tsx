'use client'

import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHistoryContext } from './contexts/HistoryContext'
import {
  computePositionDistribution,
  type PositionDistributionResult,
} from './lib/historyCalculations'

interface BucketConfig {
  key: keyof Omit<PositionDistributionResult, 'total'>
  label: string
  shortLabel: string
  className: string // bg-* token
}

const BUCKETS: BucketConfig[] = [
  { key: 'top3', label: 'Top 3', shortLabel: '1-3', className: 'bg-success' },
  { key: 'top10', label: 'Top 10', shortLabel: '4-10', className: 'bg-info' },
  { key: 'top20', label: 'Top 20', shortLabel: '11-20', className: 'bg-warning' },
  {
    key: 'beyond',
    label: '21+',
    shortLabel: '21+',
    className: 'bg-muted-foreground',
  },
  {
    key: 'unranked',
    label: 'ไม่ติดอันดับ',
    shortLabel: '-',
    className: 'bg-muted',
  },
]

interface PositionDistributionProps {
  className?: string
}

export const PositionDistribution = ({ className }: PositionDistributionProps) => {
  const { currentKeywords } = useHistoryContext()
  const dist = computePositionDistribution(currentKeywords)

  if (dist.total === 0) {
    return (
      <div className={cn('border-border bg-card rounded-2xl border p-4 md:p-5', className)}>
        <div className="mb-2 flex items-center gap-2">
          <Trophy className="text-info size-5" />
          <h3 className="font-bold">การกระจาย Position</h3>
        </div>
        <p className="text-muted-foreground py-4 text-center text-sm">ยังไม่มีคีย์เวิร์ดในรายงาน</p>
      </div>
    )
  }

  return (
    <div className={cn('border-border bg-card rounded-2xl border p-4 md:p-5', className)}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="text-info size-5" />
          <h3 className="font-bold">การกระจาย Position</h3>
        </div>
        <span className="text-muted-foreground text-xs">{dist.total} คีย์เวิร์ดทั้งหมด</span>
      </div>

      {/* Stacked bar */}
      <div
        className="mb-3 flex h-7 overflow-hidden rounded-full"
        role="img"
        aria-label={`การกระจาย: ${BUCKETS.map((b) => `${b.label} ${dist[b.key]}`).join(', ')}`}
      >
        {BUCKETS.map((bucket) => {
          const count = dist[bucket.key]
          if (count === 0) return null
          const widthPct = (count / dist.total) * 100
          return (
            <div
              key={bucket.key}
              className={cn(
                'flex items-center justify-center text-xs font-semibold text-white transition-opacity hover:opacity-80',
                bucket.className,
              )}
              style={{ width: `${widthPct}%` }}
              title={`${bucket.label}: ${count} keyword (${widthPct.toFixed(0)}%)`}
            >
              {widthPct >= 8 && count}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
        {BUCKETS.map((bucket) => {
          const count = dist[bucket.key]
          return (
            <li
              key={bucket.key}
              className={cn('flex items-center gap-1.5 text-xs', count === 0 && 'opacity-50')}
            >
              <span className={cn('size-2.5 rounded-sm', bucket.className)} aria-hidden="true" />
              <span className="text-muted-foreground">{bucket.label}</span>
              <span className="font-semibold">{count}</span>
            </li>
          )
        })}
      </ul>

      {/* Screen reader fallback */}
      <table className="sr-only">
        <caption>การกระจาย Position ของคีย์เวิร์ด</caption>
        <thead>
          <tr>
            <th>Bucket</th>
            <th>จำนวน</th>
          </tr>
        </thead>
        <tbody>
          {BUCKETS.map((b) => (
            <tr key={b.key}>
              <td>{b.label}</td>
              <td>{dist[b.key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
