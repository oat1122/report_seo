'use client'

import { useMemo } from 'react'
import { AnimatedNumber, GrowBar, Stagger, StaggerItem } from '@/components/motion'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useWorkProgressPlan } from '../../hooks/useWorkProgressPlan'
import {
  calcPlanOverallPercent,
  getEffectiveItemPercent,
  isItemCompleted,
} from '@/features/work-progress/domain/policies/progress-calculator'

interface ProgressSummaryCardsProps {
  userId: string
  planId: string
}

const TILE =
  'border-glass-border bg-glass-tile flex flex-col gap-1 rounded-[16px] border px-4 py-3.5'
const pct = (n: number) => `${Math.round(n)}%`

// แถวสรุปของแผน: ความคืบหน้ารวม (แถบ) + Item ทั้งหมด / เสร็จแล้ว / กำลังทำ / ยังไม่เริ่ม
export function ProgressSummaryCards({ userId, planId }: ProgressSummaryCardsProps) {
  const { data, isLoading } = useWorkProgressPlan(userId, planId)

  const stats = useMemo(() => {
    if (!data) return null
    let completed = 0
    let inProgress = 0
    for (const item of data.items) {
      if (isItemCompleted(item)) completed += 1
      else if (getEffectiveItemPercent(item) > 0) inProgress += 1
    }
    const total = data.items.length
    return {
      overall: calcPlanOverallPercent(data.items),
      total,
      completed,
      inProgress,
      notStarted: total - completed - inProgress,
      totalMarks: data.items.reduce((s, i) => s + i.periodMarks.length, 0),
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]">
        <Skeleton className="col-span-2 h-[92px] rounded-[16px] sm:col-span-4 xl:col-span-1" />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[92px] rounded-[16px]" />
        ))}
      </div>
    )
  }
  if (!stats) return null

  const tiles = [
    { label: 'Item ทั้งหมด', value: stats.total },
    { label: 'เสร็จแล้ว', value: stats.completed, suffix: ` / ${stats.total}` },
    { label: 'กำลังทำ', value: stats.inProgress },
    { label: 'ยังไม่เริ่ม', value: stats.notStarted },
  ]

  return (
    <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]">
      <StaggerItem
        className={cn(TILE, 'col-span-2 justify-center gap-2.5 sm:col-span-4 xl:col-span-1')}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-text-secondary text-[13px]">ความคืบหน้ารวม</span>
          <AnimatedNumber
            value={stats.overall}
            format={pct}
            className="text-[32px] leading-none font-semibold tabular-nums"
          />
        </div>
        <div
          role="progressbar"
          aria-label="ความคืบหน้ารวมของแผน"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={stats.overall}
          className="bg-info-subtle h-3 overflow-hidden rounded-full"
        >
          <GrowBar
            value={stats.overall}
            className={cn(
              'h-full rounded-full',
              stats.overall >= 100 ? 'bg-secondary' : 'bg-info-strong',
            )}
          />
        </div>
        <span className="text-text-secondary text-xs">
          คิดจากทุก item แบบถ่วงน้ำหนัก · ตั้ง mark แล้ว{' '}
          <span className="tabular-nums">{stats.totalMarks.toLocaleString('th-TH')}</span> ช่อง
        </span>
      </StaggerItem>

      {tiles.map((t) => (
        <StaggerItem key={t.label} className={TILE}>
          <span className="text-text-secondary text-[13px]">{t.label}</span>
          <span className="text-[26px] leading-tight font-semibold tabular-nums">
            <AnimatedNumber value={t.value} />
            {t.suffix && (
              <span className="text-text-secondary text-[13px] font-normal">{t.suffix}</span>
            )}
          </span>
        </StaggerItem>
      ))}
    </Stagger>
  )
}
