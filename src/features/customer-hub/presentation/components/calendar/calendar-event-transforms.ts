import 'temporal-polyfill/global'
import type { CalendarEvent } from '@schedule-x/calendar'
import type { WorkProgressPlanDetail, WorkProgressItemWithMarks } from '@/features/work-progress'
import {
  deriveRecurrenceOccurrences,
  readItemRecurrence,
} from '@/features/work-progress/domain/policies/recurrence'
import type { BillingCycleWithPlan } from '@/features/payments'
import type { BillingCycleStatus } from '@/features/payments'

function toPlainDate(date: Date | string): Temporal.PlainDate {
  const d = typeof date === 'string' ? new Date(date) : date
  return Temporal.PlainDate.from({
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  })
}

const STATUS_TO_CALENDAR_ID: Record<BillingCycleStatus, string> = {
  PAID: 'payment-paid',
  OVERDUE: 'payment-overdue',
  PENDING: 'payment-pending',
  REVIEWING: 'payment-reviewing',
  CANCELLED: 'payment-cancelled',
}

export type CalendarItemLookup = Map<string, WorkProgressItemWithMarks & { planTitle: string }>

function wpCustomContent(item: WorkProgressItemWithMarks, planTitle: string) {
  return {
    categoryName: item.category.name,
    statusName: item.status.name,
    planTitle,
  }
}

export function workProgressPlanToEvents(
  plan: WorkProgressPlanDetail,
  itemLookup: CalendarItemLookup,
): CalendarEvent[] {
  const periodMap = new Map(plan.periods.map((p) => [p.id, p]))
  const events: CalendarEvent[] = []

  for (const item of plan.items) {
    const markByPeriod = new Map(item.periodMarks.map((m) => [m.periodId, m]))

    // วันที่ระดับวันต่อเดือน: รวม period ที่ (1) มี mark พร้อม scheduledDate
    // (2) เป็นรอบของงานทำซ้ำตามกฎ (เช่น ทุกวันที่ 14)
    const rule = readItemRecurrence(item)
    const occurrences = rule ? deriveRecurrenceOccurrences(plan.periods, rule) : new Map<string, Date>()

    const dayLevelPeriodIds = new Set<string>()
    for (const m of item.periodMarks) {
      if (m.scheduledDate != null) dayLevelPeriodIds.add(m.periodId)
    }
    for (const pid of occurrences.keys()) dayLevelPeriodIds.add(pid)

    if (dayLevelPeriodIds.size > 0) {
      // โหมดระดับวัน → 1 event ต่อรอบ (single-day)
      for (const periodId of dayLevelPeriodIds) {
        const mark = markByPeriod.get(periodId)
        const rawDate = mark?.scheduledDate ?? occurrences.get(periodId) ?? null
        if (rawDate == null) continue
        const date = toPlainDate(rawDate)
        const eventId = `wp-${item.id}-${periodId}`
        itemLookup.set(eventId, { ...item, planTitle: plan.title })
        events.push({
          id: eventId,
          start: date,
          end: date,
          title: item.activity,
          calendarId: 'work-progress',
          _customContent: wpCustomContent(item, plan.title),
        })
      }
      continue
    }

    // Fallback (งาน one-shot ที่ไม่ผูกวัน): ใช้ช่วงของ item หรือช่วง period ที่ถูก mark
    let start: Temporal.PlainDate | null = null
    let end: Temporal.PlainDate | null = null

    if (item.startDate != null && item.dueDate != null) {
      start = toPlainDate(item.startDate)
      end = toPlainDate(item.dueDate)
    } else if (item.periodMarks.length > 0) {
      const markedPeriods = item.periodMarks
        .map((m) => periodMap.get(m.periodId))
        .filter((p) => p != null && p.startDate != null && p.endDate != null)
        .sort((a, b) => a!.seq - b!.seq)

      if (markedPeriods.length > 0) {
        start = toPlainDate(markedPeriods[0]!.startDate!)
        end = toPlainDate(markedPeriods[markedPeriods.length - 1]!.endDate!)
      }
    }

    if (!start || !end) continue

    const eventId = `wp-${item.id}`
    itemLookup.set(eventId, { ...item, planTitle: plan.title })
    events.push({
      id: eventId,
      start,
      end,
      title: item.activity,
      calendarId: 'work-progress',
      _customContent: wpCustomContent(item, plan.title),
    })
  }

  return events
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export function billingCyclesToEvents(cycles: BillingCycleWithPlan[]): CalendarEvent[] {
  return cycles
    .filter((c) => c.status !== 'CANCELLED')
    .map((cycle) => {
      const date = toPlainDate(cycle.dueDate)
      return {
        id: `pay-${cycle.id}`,
        start: date,
        end: date,
        title: `${cycle.plan.description} - ฿${formatAmount(cycle.amount)}`,
        calendarId: STATUS_TO_CALENDAR_ID[cycle.status],
        _customContent: {
          status: cycle.status,
          amount: String(cycle.amount),
          cycleNumber: String(cycle.cycleNumber),
          planDescription: cycle.plan.description,
        },
      }
    })
}
