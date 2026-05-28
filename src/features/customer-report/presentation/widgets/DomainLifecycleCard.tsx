'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { computeDomainPhase, type DomainPhase } from '../lib/historyCalculations'
import type { OverallMetricsForm } from '@/types/metrics'

interface DomainLifecycleCardProps {
  metrics: OverallMetricsForm | null | undefined
}

const phaseClassMap: Record<DomainPhase, { dot: string; badge: string; progress: string }> = {
  establishing: {
    dot: 'bg-info',
    badge: 'bg-info/10 text-info border-info/30',
    progress: '[&>div]:bg-info',
  },
  growing: {
    dot: 'bg-success',
    badge: 'bg-success/10 text-success border-success/30',
    progress: '[&>div]:bg-success',
  },
  mature: {
    dot: 'bg-primary',
    badge: 'bg-primary/10 text-primary border-primary/30',
    progress: '[&>div]:bg-primary',
  },
}

export const DomainLifecycleCard = ({ metrics }: DomainLifecycleCardProps) => {
  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="text-muted-foreground size-4" />
            Domain Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">ไม่มีข้อมูลโดเมน</p>
        </CardContent>
      </Card>
    )
  }

  const phase = computeDomainPhase(metrics.ageInYears, metrics.ageInMonths)
  const classes = phaseClassMap[phase.phase]
  const ageStr = `${metrics.ageInYears}y ${metrics.ageInMonths}m`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="text-muted-foreground size-4" />
          Domain Lifecycle
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <span className="text-3xl font-extrabold tabular-nums md:text-4xl">{ageStr}</span>
          <Badge variant="outline" className={cn('gap-1.5', classes.badge)}>
            <span className={cn('size-2 rounded-full', classes.dot)} aria-hidden="true" />
            {phase.label}
          </Badge>
        </div>

        <Progress
          value={phase.progressWithinPhase}
          className={cn('mb-2 h-2', classes.progress)}
          aria-label={`ความคืบหน้าในช่วง ${phase.label} ${phase.progressWithinPhase.toFixed(0)}%`}
        />

        <p className="text-muted-foreground text-sm leading-relaxed">{phase.description}</p>
      </CardContent>
    </Card>
  )
}
