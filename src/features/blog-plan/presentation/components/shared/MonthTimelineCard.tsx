'use client'

import { Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatShortDate } from '@/lib/date'
import { getCurrentStage, groupArticle } from './blog-plan-view'
import { buildStageWindows } from '../../../domain/policies/stage-schedule'
import type { BlogArticle } from '../../../domain/BlogArticle'

/** tick บนแกนวัน — ทุก 5 วัน แล้วปิดท้ายด้วยวันสุดท้ายของเดือน */
function buildTicks(daysInMonth: number): number[] {
  const ticks: number[] = []
  for (let day = 1; day <= daysInMonth; day += 5) ticks.push(day)
  if (ticks[ticks.length - 1] !== daysInMonth) ticks.push(daysInMonth)
  return ticks
}

interface MonthTimelineCardProps {
  articles: BlogArticle[]
  year: number
  month: number
  canManage: boolean
  canRespond: boolean
}

export function MonthTimelineCard({
  articles,
  year,
  month,
  canManage,
  canRespond,
}: MonthTimelineCardProps) {
  const monthStart = new Date(year, month - 1, 1).getTime()
  const monthEnd = new Date(year, month, 1).getTime()
  const span = monthEnd - monthStart
  const daysInMonth = new Date(year, month, 0).getDate()

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
  const todayPercent = isCurrentMonth ? toPercent(today.getTime(), monthStart, span) : null

  return (
    <Card className="bg-muted/50 min-w-75">
      <CardContent className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <strong className="text-[15px] font-semibold">ไทม์ไลน์ทั้งเดือน</strong>
          <span className="text-muted-foreground text-xs">
            แถบสีเขียว = ช่วงที่รอฝั่งลูกค้า · แถบสีเข้ม = ช่วงที่ทีมเขียนทำงาน
          </span>
          <div className="text-muted-foreground ml-auto flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="bg-primary h-2.5 w-3.5 rounded-sm" />
              ทีมเขียน
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-secondary h-2.5 w-3.5 rounded-sm" />
              ลูกค้า
            </span>
            {isCurrentMonth && (
              <span className="flex items-center gap-1.5">
                <span className="bg-destructive h-3 w-0.5" />
                วันนี้
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex min-w-125 flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <span className="w-42.5 shrink-0" />
              <div className="relative h-4 flex-1">
                {buildTicks(daysInMonth).map((day) => (
                  <span
                    key={day}
                    className="text-muted-foreground absolute top-0 text-[11px]"
                    style={
                      day === daysInMonth
                        ? { right: 0 }
                        : { left: `${((day - 1) / daysInMonth) * 100}%` }
                    }
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>

            {articles.map((article) => (
              <TimelineRow
                key={article.id}
                article={article}
                monthStart={monthStart}
                span={span}
                todayPercent={todayPercent}
                canManage={canManage}
                canRespond={canRespond}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TimelineRow({
  article,
  monthStart,
  span,
  todayPercent,
  canManage,
  canRespond,
}: {
  article: BlogArticle
  monthStart: number
  span: number
  todayPercent: number | null
  canManage: boolean
  canRespond: boolean
}) {
  const group = groupArticle(article.status, canManage, canRespond)
  const current = getCurrentStage(article)
  const windows = buildStageWindows(article.startDate, article.stages).flatMap((window) => {
    const left = toPercent(window.start.getTime(), monthStart, span)
    const right = toPercent(window.end.getTime(), monthStart, span)
    if (right <= 0 || left >= 100) return []
    return [{ ...window, left, width: Math.max(right - left, 1.5) }]
  })

  const finishedAt = article.stages.find((stage) => stage.stageCode === 'SUBMIT_FINAL')?.submittedAt

  return (
    <div className="flex items-center gap-3">
      <div className="flex w-42.5 shrink-0 items-center gap-2 overflow-hidden">
        <span
          className={cn(
            'size-1.75 shrink-0 rounded-full',
            group === 'mine' && 'bg-secondary animate-pulse',
            group === 'done' && 'bg-success',
            group === 'waiting' && 'bg-muted-foreground/40',
          )}
        />
        <span
          className={cn(
            'truncate text-[13px] font-medium',
            group === 'done' && 'text-muted-foreground',
          )}
        >
          {article.title}
        </span>
      </div>

      <div className="bg-muted-foreground/10 relative h-7 flex-1 rounded-lg">
        {article.status === 'PUBLISHED' ? (
          <span className="text-success absolute inset-y-0 left-2 flex items-center gap-1.5 text-[11.5px] font-medium">
            <Check className="size-3.5" />
            ส่งครบแล้ว {formatShortDate(finishedAt)}
          </span>
        ) : windows.length === 0 ? (
          <span className="text-muted-foreground absolute inset-y-0 left-2 flex items-center text-[11.5px]">
            ยังไม่กำหนดวัน
          </span>
        ) : (
          windows.map((window) => {
            const isCurrent = current?.definition.code === window.stageCode
            const isClient = window.actor === 'CLIENT'

            return (
              <span
                key={window.stageCode}
                title={`${window.stageCode} · ${formatShortDate(window.start)} – ${formatShortDate(window.end)}`}
                className={cn(
                  'absolute flex items-center justify-center overflow-hidden rounded-md text-[11px] font-medium',
                  isCurrent ? 'inset-y-0 rounded-lg' : 'inset-y-1.5',
                  isClient
                    ? isCurrent
                      ? 'bg-secondary text-secondary-foreground ring-primary ring-offset-card ring-2 ring-offset-2'
                      : 'bg-secondary/30'
                    : isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/15',
                )}
                style={{ left: `${window.left}%`, width: `${window.width}%` }}
              >
                {isCurrent && window.width > 10 && (isClient ? 'ถึงคิวลูกค้า' : 'ทีมกำลังทำ')}
              </span>
            )
          })
        )}

        {todayPercent !== null && (
          <span
            className="bg-destructive absolute -inset-y-1 w-0.5 rounded-full"
            style={{ left: `${todayPercent}%` }}
          />
        )}
      </div>
    </div>
  )
}

function toPercent(time: number, monthStart: number, span: number): number {
  return Math.min(100, Math.max(0, ((time - monthStart) / span) * 100))
}
