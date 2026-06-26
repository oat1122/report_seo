'use client'

import { ListChecks, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { NextStepPriority } from '../../domain/NextStep'
import { useGetNextSteps } from '../hooks/useNextSteps'

interface NextStepsCardProps {
  customerId: string
  // จำกัดจำนวนที่โชว์ (เช่น glimpse บนหน้า /customer hub) — ไม่ใส่ = โชว์ทั้งหมด
  limit?: number
  className?: string
}

const priorityStyle: Record<NextStepPriority, { label: string; badge: string; dot: string }> = {
  HIGH: { label: 'สำคัญมาก', badge: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
  MEDIUM: { label: 'ปานกลาง', badge: 'bg-warning/10 text-warning', dot: 'bg-warning' },
  LOW: { label: 'ทั่วไป', badge: 'bg-info/10 text-info', dot: 'bg-info' },
}

export function NextStepsCard({ customerId, limit, className }: NextStepsCardProps) {
  const { data, isLoading } = useGetNextSteps(customerId)

  if (isLoading) {
    return <Skeleton className={cn('h-44 w-full rounded-2xl', className)} />
  }

  const steps = data ?? []
  if (steps.length === 0) return null

  const shown = limit ? steps.slice(0, limit) : steps
  const hiddenCount = steps.length - shown.length

  return (
    <Card className={cn('border-border', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="bg-info/15 text-info flex size-8 items-center justify-center rounded-lg">
            <ListChecks className="size-4" />
          </span>
          สิ่งที่แนะนำให้ทำต่อ
          <Badge variant="outline" className="text-muted-foreground ml-auto font-semibold">
            {steps.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {shown.map((step) => {
          const p = priorityStyle[step.priority]
          return (
            <div
              key={step.id}
              className="border-border bg-card flex items-start gap-3 rounded-xl border p-4"
            >
              <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', p.dot)} aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="font-semibold break-words">{step.title}</p>
                  <Badge className={cn('font-semibold', p.badge)}>{p.label}</Badge>
                </div>
                {step.description && (
                  <p className="text-muted-foreground text-sm break-words whitespace-pre-line">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}

        {hiddenCount > 0 && (
          <p className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
            <ArrowRight className="size-3.5" />
            และอีก {hiddenCount} รายการในรายงานเต็ม
          </p>
        )}
      </CardContent>
    </Card>
  )
}
