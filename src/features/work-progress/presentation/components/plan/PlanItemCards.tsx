'use client'

import { Check, Repeat } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusChip } from './StatusChip'
import { onColorTextClass, splitPeriodLabel } from './planDisplay'
import type { WorkProgressItemWithMarks, WorkProgressPeriod } from '@/features/work-progress'

interface PlanItemCardsProps {
  items: WorkProgressItemWithMarks[]
  periods: WorkProgressPeriod[]
  currentPeriodId: string | null
  onOpenDetail: (item: WorkProgressItemWithMarks) => void
}

// มุมมองมือถือของตารางแบบอ่านอย่างเดียว — 1 item = 1 การ์ด + แถบรอบย่อ (ไม่มี scroll แนวนอน)
export function PlanItemCards({
  items,
  periods,
  currentPeriodId,
  onOpenDetail,
}: PlanItemCardsProps) {
  const cols = Math.max(1, Math.min(12, periods.length))
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => {
        const marksByPeriod = new Map(item.periodMarks.map((m) => [m.periodId, m]))
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onOpenDetail(item)}
              className="border-glass-border bg-glass-tile focus-visible:ring-ring/70 flex w-full flex-col gap-2.5 rounded-[16px] border p-3 text-left outline-none focus-visible:ring-[3px]"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="bg-muted text-text-secondary truncate rounded-[6px] px-2 py-0.5 text-[11px]">
                  {item.category.name}
                </span>
                <StatusChip name={item.status.name} color={item.status.color} />
              </span>
              <span className="flex items-center gap-1.5 text-[15px] font-medium">
                <span className="line-clamp-2">{item.activity}</span>
                {item.isRecurring && (
                  <Repeat
                    className="text-info-strong size-3.5 shrink-0"
                    aria-label="งานทำซ้ำรายเดือน"
                  />
                )}
              </span>
              {periods.length > 0 && (
                <span
                  className="grid gap-x-[3px] gap-y-1"
                  style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                  {periods.map((p, i) => {
                    const mark = marksByPeriod.get(p.id)
                    const color = mark ? (item.status.color ?? mark.markType.color ?? null) : null
                    const isCurrent = p.id === currentPeriodId
                    const showLabel = i === 0 || i === periods.length - 1 || isCurrent
                    return (
                      <span key={p.id} className="flex min-w-0 flex-col items-center gap-0.5">
                        <span
                          className={cn(
                            'flex h-[26px] w-full items-center justify-center rounded-[8px]',
                            isCurrent && !mark && 'bg-info/15',
                            mark && !color && 'bg-info-subtle',
                          )}
                          style={color ? { backgroundColor: color } : undefined}
                        >
                          {mark ? (
                            <Check
                              aria-hidden
                              strokeWidth={3}
                              className={cn('size-3', color ? onColorTextClass(color) : '')}
                            />
                          ) : (
                            <span aria-hidden className="bg-border size-1 rounded-full" />
                          )}
                          <span className="sr-only">
                            {p.label}: {mark ? mark.markType.name : 'ว่าง'}
                          </span>
                        </span>
                        <span
                          aria-hidden
                          className={cn(
                            'h-3.5 truncate text-[10px] leading-none',
                            isCurrent ? 'text-foreground font-semibold' : 'text-muted-foreground',
                          )}
                        >
                          {showLabel ? splitPeriodLabel(p.label)[0] : ''}
                        </span>
                      </span>
                    )
                  })}
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
