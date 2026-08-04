'use client'

import { Check, CircleDashed, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatShortDate } from '@/lib/date'
import { BLOG_STAGES } from '../../../domain/policies/stage-schedule'
import type { BlogArticleStage, BlogStageCode } from '../../../domain/BlogArticle'

interface StageTimelineProps {
  stages: BlogArticleStage[]
  /** writer/admin กดส่ง–ยกเลิกส่งได้เฉพาะ stage ของฝั่งตัวเอง */
  onToggleSubmit?: (stageCode: BlogStageCode, submitted: boolean) => void
  /** ลูกค้า/admin ตอบ stage ของฝั่งลูกค้า */
  onRespond?: (stageCode: BlogStageCode) => void
  isPending?: boolean
}

export function StageTimeline({
  stages,
  onToggleSubmit,
  onRespond,
  isPending,
}: StageTimelineProps) {
  const byCode = new Map(stages.map((stage) => [stage.stageCode, stage]))

  return (
    <ol className="flex flex-col gap-2">
      {BLOG_STAGES.map((definition) => {
        const stage = byCode.get(definition.code)
        const isDone = Boolean(stage?.submittedAt)
        const isClientStage = definition.actor === 'CLIENT'
        const isOverdue =
          !isDone && stage?.dueDate ? new Date(stage.dueDate).getTime() < Date.now() : false

        return (
          <li
            key={definition.code}
            className={cn(
              'flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border px-3 py-2 text-sm',
              isDone ? 'border-success/30 bg-success/5' : 'border-border bg-card',
            )}
          >
            <span className="text-muted-foreground w-5 shrink-0 text-xs tabular-nums">
              {definition.seq}
            </span>

            {isDone ? (
              <Check className="text-success size-4 shrink-0" />
            ) : isOverdue ? (
              <Clock className="text-destructive size-4 shrink-0" />
            ) : (
              <CircleDashed className="text-muted-foreground size-4 shrink-0" />
            )}

            <span className="min-w-40 flex-1 font-medium">{definition.label}</span>

            <Badge
              variant="outline"
              className={cn(
                'shrink-0 text-xs',
                isClientStage
                  ? 'bg-info/10 text-info border-info/30'
                  : 'bg-muted text-muted-foreground border-border',
              )}
            >
              {isClientStage ? 'ลูกค้า' : 'ทีมเขียน'}
            </Badge>

            <span
              className={cn(
                'shrink-0 text-xs tabular-nums',
                isOverdue ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              กำหนด: {formatShortDate(stage?.dueDate)}
            </span>
            <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
              ส่งจริง: {formatShortDate(stage?.submittedAt)}
            </span>

            {!isClientStage && onToggleSubmit && (
              <Button
                size="sm"
                variant={isDone ? 'ghost' : 'secondary'}
                disabled={isPending}
                onClick={() => onToggleSubmit(definition.code, !isDone)}
              >
                {isDone ? 'ยกเลิกการส่ง' : 'ทำเครื่องหมายว่าส่งแล้ว'}
              </Button>
            )}

            {isClientStage && onRespond && (
              <Button
                size="sm"
                variant="secondary"
                disabled={isPending}
                onClick={() => onRespond(definition.code)}
              >
                {isDone ? 'ตอบใหม่' : 'ให้ความเห็น'}
              </Button>
            )}
          </li>
        )
      })}
    </ol>
  )
}
