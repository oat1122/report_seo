'use client'

import { useMemo } from 'react'
import { Cell, Pie, PieChart } from 'recharts'
import { AnimatedNumber } from '@/components/motion'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useWorkProgressPlan } from '../../hooks/useWorkProgressPlan'
import {
  getEffectiveItemPercent,
  isItemCompleted,
} from '@/features/work-progress/domain/policies/progress-calculator'

interface StatusDonutChartProps {
  userId: string
  planId: string
}

// เขียว = เสร็จ (fill เท่านั้น) · ม่วง = กำลังทำ · เทา = ยังไม่เริ่ม
const STATUS_CONFIG: ChartConfig = {
  completed: { label: 'เสร็จแล้ว', color: 'var(--chart-4)' },
  inProgress: { label: 'กำลังทำ', color: 'var(--chart-3)' },
  notStarted: { label: 'ยังไม่เริ่ม', color: 'var(--border)' },
}

export default function StatusDonutChart({ userId, planId }: StatusDonutChartProps) {
  const { data, isLoading } = useWorkProgressPlan(userId, planId)

  const { rows, total, completed, completedPercent } = useMemo(() => {
    if (!data) return { rows: [], total: 0, completed: 0, completedPercent: 0 }
    let completed = 0
    let inProgress = 0
    let notStarted = 0
    for (const item of data.items) {
      if (isItemCompleted(item)) completed += 1
      else if (getEffectiveItemPercent(item) > 0) inProgress += 1
      else notStarted += 1
    }
    const t = completed + inProgress + notStarted
    return {
      rows: [
        { key: 'completed', name: 'เสร็จแล้ว', count: completed },
        { key: 'inProgress', name: 'กำลังทำ', count: inProgress },
        { key: 'notStarted', name: 'ยังไม่เริ่ม', count: notStarted },
      ],
      total: t,
      completed,
      completedPercent: t === 0 ? 0 : Math.round((completed / t) * 100),
    }
  }, [data])

  if (isLoading) return <Skeleton className="h-[320px] w-full rounded-[20px]" />
  if (!data) return null

  const nonEmpty = rows.filter((r) => r.count > 0).length

  return (
    <Card className="gap-4 px-5 py-5 sm:px-6" role="region" aria-labelledby={`wp-status-${planId}`}>
      <div className="flex flex-col gap-1">
        <h2 id={`wp-status-${planId}`} className="text-[17px] font-semibold">
          สถานะของ item
        </h2>
        <p className="text-text-secondary text-[13px]">
          {total === 0
            ? 'ยังไม่มี item ในแผนนี้'
            : `${total.toLocaleString('th-TH')} รายการในแผนนี้ · เสร็จแล้ว ${completed.toLocaleString('th-TH')} รายการ`}
        </p>
      </div>

      {total === 0 ? (
        <p className="text-text-secondary border-border rounded-[16px] border border-dashed px-4 py-10 text-center text-sm">
          เมื่อเพิ่ม item แล้ว สัดส่วนสถานะจะแสดงที่นี่
        </p>
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col">
          <div className="relative size-[140px] shrink-0">
            <ChartContainer config={STATUS_CONFIG} className="aspect-square size-full">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="key" hideLabel />}
                />
                <Pie
                  data={rows}
                  dataKey="count"
                  nameKey="key"
                  innerRadius={52}
                  outerRadius={68}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={nonEmpty > 1 ? 2 : 0}
                  stroke="none"
                  animationDuration={800}
                >
                  {rows.map((r) => (
                    <Cell key={r.key} fill={`var(--color-${r.key})`} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center leading-tight">
              <AnimatedNumber
                value={completedPercent}
                format={(n) => `${Math.round(n)}%`}
                className="text-2xl font-semibold tabular-nums"
              />
              <span className="text-text-secondary text-[11px]">เสร็จแล้ว</span>
            </div>
          </div>

          <ul className="flex w-full flex-col gap-2" aria-label="จำนวน item ตามสถานะ">
            {rows.map((r) => (
              <li key={r.key} className="flex items-center justify-between gap-2 text-[13px]">
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="ring-border size-2.5 rounded-[3px] ring-1 ring-inset"
                    style={{ backgroundColor: STATUS_CONFIG[r.key]?.color }}
                  />
                  {r.name}
                </span>
                <strong className="font-semibold tabular-nums">
                  {r.count.toLocaleString('th-TH')}
                </strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
