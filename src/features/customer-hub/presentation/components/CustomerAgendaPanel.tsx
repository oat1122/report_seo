'use client'

import 'temporal-polyfill/global'
import { useState } from 'react'
import Link from 'next/link'
import { CalendarDays, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react'
import type { CalendarEvent } from '@schedule-x/calendar'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { CalendarItemLookup } from './calendar/calendar-event-transforms'

interface CustomerAgendaPanelProps {
  userId: string
  events: CalendarEvent[]
  itemLookup: CalendarItemLookup
  isLoading: boolean
}

interface AgendaRow {
  id: string
  date: Temporal.PlainDate
  title: string
  isPayment: boolean
}

const MAX_ROWS = 10

function toPlainDate(value: unknown): Temporal.PlainDate {
  if (value instanceof Temporal.PlainDate) return value
  if (value instanceof Temporal.PlainDateTime) return value.toPlainDate()
  return Temporal.PlainDate.from(String(value).slice(0, 10))
}

function dateLabel(date: Temporal.PlainDate, today: Temporal.PlainDate): string {
  const diff = today.until(date, { largestUnit: 'day' }).days
  if (diff === 0) return 'วันนี้'
  if (diff === 1) return 'พรุ่งนี้'
  const d = new Date(date.year, date.month - 1, date.day)
  return new Intl.DateTimeFormat('th-TH', { weekday: 'short' }).format(d)
}

function dotClass(date: Temporal.PlainDate, today: Temporal.PlainDate): string {
  return Temporal.PlainDate.compare(date, today) === 0 ? 'bg-info' : 'bg-secondary'
}

function selectRows(events: CalendarEvent[], today: Temporal.PlainDate): AgendaRow[] {
  const sorted = events
    .map((e) => ({
      id: String(e.id),
      date: toPlainDate(e.start),
      title: e.title ?? '',
      isPayment: String(e.id).startsWith('pay-'),
    }))
    .filter((r) => Temporal.PlainDate.compare(r.date, today) >= 0)
    .sort((a, b) => Temporal.PlainDate.compare(a.date, b.date))

  // งวดชำระเงินถูก pre-generate ล่วงหน้าหลายเดือน → เก็บแค่งวดที่ใกล้ที่สุด 1 งวด
  // กันไม่ให้ payment ท่วมจนงาน work-progress ไม่โผล่
  let paymentTaken = false
  return sorted
    .filter((r) => {
      if (!r.isPayment) return true
      if (paymentTaken) return false
      paymentTaken = true
      return true
    })
    .slice(0, MAX_ROWS)
}

export function CustomerAgendaPanel({
  userId,
  events,
  itemLookup,
  isLoading,
}: CustomerAgendaPanelProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const today = Temporal.Now.plainDateISO()
  const rows = selectRows(events, today)
  const toggle = (id: string) => setOpen((s) => ({ ...s, [id]: !s[id] }))

  return (
    <Card className="rounded-2xl">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="text-info size-5" />
          กำหนดการ &amp; งานใกล้ถึง
        </CardTitle>
        <CardAction>
          <Link
            href={`/customer/${userId}/work-progress`}
            className="text-info flex items-center gap-1 text-xs font-medium hover:underline"
          >
            เปิดปฏิทินเต็ม
            <ChevronRight className="size-3" />
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent className="px-5 py-1">
        {isLoading ? (
          <div className="flex flex-col gap-3 py-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">ไม่มีกำหนดการที่ใกล้ถึง</p>
        ) : (
          rows.map((row) => {
            const item = row.isPayment ? null : itemLookup.get(row.id)
            const subtasks = item?.subtasks ?? []
            const canExpand = subtasks.length > 0
            const isOpen = !!open[row.id]
            const subtitle = row.isPayment
              ? 'การชำระเงิน'
              : item
                ? `${item.category.name} · ${subtasks.length} งานย่อย`
                : ''

            return (
              <div key={row.id} className="border-b last:border-b-0">
                <div
                  className={cn('flex items-center gap-3 py-3', canExpand && 'cursor-pointer')}
                  role={canExpand ? 'button' : undefined}
                  tabIndex={canExpand ? 0 : undefined}
                  onClick={canExpand ? () => toggle(row.id) : undefined}
                  onKeyDown={
                    canExpand
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            toggle(row.id)
                          }
                        }
                      : undefined
                  }
                >
                  <div className="w-12 shrink-0 text-center">
                    <div className="text-muted-foreground text-[11px]">
                      {dateLabel(row.date, today)}
                    </div>
                    <div className="text-lg leading-tight font-bold tabular-nums">
                      {row.date.day}
                    </div>
                  </div>
                  <span className={cn('size-2 shrink-0 rounded-full', dotClass(row.date, today))} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{row.title}</div>
                    {subtitle && <div className="text-muted-foreground text-xs">{subtitle}</div>}
                  </div>
                  {canExpand ? (
                    isOpen ? (
                      <ChevronUp className="text-muted-foreground size-4 shrink-0" />
                    ) : (
                      <ChevronDown className="text-muted-foreground/60 size-4 shrink-0" />
                    )
                  ) : (
                    <span className="size-4 shrink-0" />
                  )}
                </div>

                {canExpand && isOpen && (
                  <div className="flex flex-col gap-2 pb-3 pl-[60px]">
                    {subtasks.map((sub) => (
                      <div key={sub.id} className="flex items-center gap-2">
                        <span
                          className={cn(
                            'size-3.5 shrink-0 rounded-[4px] border',
                            sub.isDone ? 'bg-secondary border-secondary' : 'border-input',
                          )}
                        />
                        <span
                          className={cn(
                            'text-[13px]',
                            sub.isDone ? 'text-muted-foreground line-through' : 'text-foreground',
                          )}
                        >
                          {sub.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
