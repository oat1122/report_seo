'use client'

import { useMemo } from 'react'
import { Cell, Label, Pie, PieChart } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

const STATUS_CONFIG: ChartConfig = {
  completed: { label: 'เสร็จแล้ว', color: 'var(--chart-1)' },
  inProgress: { label: 'กำลังทำ', color: 'var(--chart-2)' },
  notStarted: { label: 'ยังไม่เริ่ม', color: 'var(--muted)' },
}

export default function StatusDonutChart({ userId, planId }: StatusDonutChartProps) {
  const { data, isLoading } = useWorkProgressPlan(userId, planId)

  const { rows, total, completedPercent } = useMemo(() => {
    if (!data) return { rows: [], total: 0, completedPercent: 0 }
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
      completedPercent: t === 0 ? 0 : Math.round((completed / t) * 100),
    }
  }, [data])

  if (isLoading) return <Skeleton className="h-64 w-full" />
  if (!data || total === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">สถานะของ item</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={STATUS_CONFIG} className="h-64 w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            <Pie
              data={rows}
              dataKey="count"
              nameKey="name"
              innerRadius={55}
              outerRadius={85}
              strokeWidth={2}
            >
              {rows.map((r) => (
                <Cell key={r.key} fill={`var(--color-${r.key})`} />
              ))}
              <Label
                position="center"
                content={({ viewBox }) => {
                  if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null
                  const { cx, cy } = viewBox as { cx: number; cy: number }
                  return (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan
                        x={cx}
                        y={cy - 6}
                        className="fill-foreground text-2xl font-semibold tabular-nums"
                      >
                        {completedPercent}%
                      </tspan>
                      <tspan x={cx} y={cy + 14} className="fill-muted-foreground text-xs">
                        เสร็จแล้ว
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
