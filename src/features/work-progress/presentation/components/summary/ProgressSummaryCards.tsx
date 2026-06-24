'use client'

import { CheckCircle2, Clock, ListChecks, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { KpiGridSkeleton } from '@/components/skeletons'
import { useWorkProgressPlan } from '../../hooks/useWorkProgressPlan'
import {
  calcPlanOverallPercent,
  isItemCompleted,
} from '@/features/work-progress/domain/policies/progress-calculator'

interface ProgressSummaryCardsProps {
  userId: string
  planId: string
}

export function ProgressSummaryCards({ userId, planId }: ProgressSummaryCardsProps) {
  const { data, isLoading } = useWorkProgressPlan(userId, planId)

  if (isLoading) {
    return <KpiGridSkeleton count={4} />
  }
  if (!data) return null

  const overall = calcPlanOverallPercent(data.items)
  const totalItems = data.items.length
  const completed = data.items.filter(isItemCompleted).length
  const inProgress = totalItems - completed
  const totalMarks = data.items.reduce((s, i) => s + i.periodMarks.length, 0)

  const cards = [
    {
      label: 'ความคืบหน้ารวม',
      value: `${overall}%`,
      icon: TrendingUp,
      tint: 'bg-primary/10 text-primary',
    },
    {
      label: 'Item ทั้งหมด',
      value: String(totalItems),
      icon: ListChecks,
      tint: 'bg-info/10 text-info',
    },
    {
      label: 'เสร็จแล้ว',
      value: `${completed}/${totalItems}`,
      icon: CheckCircle2,
      tint: 'bg-secondary/30 text-secondary-foreground dark:text-secondary',
    },
    {
      label: 'Marks · กำลังทำ',
      value: `${totalMarks} · ${inProgress}`,
      icon: Clock,
      tint: 'bg-muted text-muted-foreground',
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <Card key={c.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={'flex size-10 items-center justify-center rounded-md ' + c.tint}>
                <Icon className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">{c.label}</span>
                <span className="text-lg font-semibold tabular-nums">{c.value}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
