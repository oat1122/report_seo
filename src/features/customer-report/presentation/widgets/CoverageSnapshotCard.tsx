'use client'

import { useMemo, type ReactNode } from 'react'
import { Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useHistoryContext } from '../contexts/HistoryContext'
import { computeCoverageStats } from '../lib/historyCalculations'
import { formatDateCE, formatTimeTH } from '../lib/formatters'

const fmtRelativeOrDate = (date: Date | null): string => {
  if (!date) return '—'
  const diffHours = (Date.now() - date.getTime()) / (1000 * 60 * 60)
  if (diffHours < 1) return 'ไม่กี่นาทีที่แล้ว'
  if (diffHours < 24) return `${Math.floor(diffHours)} ชั่วโมงที่แล้ว`
  return `${formatDateCE(date)} · ${formatTimeTH(date)}`
}

interface CoverageSnapshotCardProps {
  className?: string
  /** ลิงก์/ปุ่มเสริมชิดขวา */
  action?: ReactNode
}

/** แถบสรุปการครอบคลุม: ติดตามกี่ keyword · Top/Other · อัปเดตล่าสุด */
export const CoverageSnapshotCard = ({ className, action }: CoverageSnapshotCardProps) => {
  const { currentKeywords, metricsHistory } = useHistoryContext()
  const stats = useMemo(() => {
    const top = currentKeywords.filter((k) => k.isTopReport)
    const other = currentKeywords.filter((k) => !k.isTopReport)
    return computeCoverageStats(top, other, metricsHistory)
  }, [currentKeywords, metricsHistory])

  return (
    <Card className={cn('min-w-0', className)} size="sm">
      <CardContent className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="bg-info-subtle text-info-strong flex size-9 items-center justify-center rounded-xl"
          >
            <Activity className="size-[18px]" />
          </span>
          <span className="text-sm font-medium">
            ติดตาม <span className="font-semibold tabular-nums">{stats.trackedKeywords}</span>{' '}
            Keyword
          </span>
        </div>
        <span className="text-text-secondary text-sm">
          Top{' '}
          <span className="text-foreground font-semibold tabular-nums">
            {stats.topKeywordsCount}
          </span>{' '}
          + Other{' '}
          <span className="text-foreground font-semibold tabular-nums">
            {stats.otherKeywordsCount}
          </span>
        </span>
        <span className="text-text-secondary flex items-center gap-1.5 text-sm">
          <span
            aria-hidden
            className="bg-secondary size-2 rounded-full shadow-[0_0_0_3px_color-mix(in_oklab,var(--secondary)_25%,transparent)]"
          />
          อัปเดต {fmtRelativeOrDate(stats.lastUpdated)}
        </span>
        {action && <div className="w-full sm:ml-auto sm:w-auto">{action}</div>}
      </CardContent>
    </Card>
  )
}
