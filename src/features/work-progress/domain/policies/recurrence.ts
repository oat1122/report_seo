// Recurrence policy — งานที่ทำซ้ำเป็นรอบ (เฟสแรกรองรับ MONTHLY)
// แนวคิด: เก็บแค่ "กฎ" ไว้ที่ item แล้วคำนวณวันที่ของแต่ละเดือนตอนแสดง (derive-on-read)
// จึงไม่ต้อง pre-create mark ล่วงหน้า และแก้กฎแล้ววันขยับเองโดยไม่ต้องเขียน DB

export type RecurrenceFreq = 'MONTHLY'

export interface RecurrenceRule {
  freq: RecurrenceFreq
  interval: number // ทุก N เดือน (1 = ทุกเดือน)
  dayOfMonth: number // 1-31
}

interface RecurrenceItemLike {
  isRecurring: boolean
  recurrenceFreq: string | null
  recurrenceInterval: number
  recurrenceDayOfMonth: number | null
}

// อ่านกฎจาก item — คืน null ถ้าไม่ใช่งานทำซ้ำหรือกฎไม่ครบ
export function readItemRecurrence(item: RecurrenceItemLike): RecurrenceRule | null {
  if (!item.isRecurring) return null
  if (item.recurrenceFreq !== 'MONTHLY') return null
  if (item.recurrenceDayOfMonth == null) return null
  const interval = item.recurrenceInterval >= 1 ? item.recurrenceInterval : 1
  return {
    freq: 'MONTHLY',
    interval,
    dayOfMonth: item.recurrenceDayOfMonth,
  }
}

// วันสุดท้ายของเดือน (monthZero = 0-11)
function lastDayOfMonth(year: number, monthZero: number): number {
  return new Date(year, monthZero + 1, 0).getDate()
}

// แปลง (ปี, เดือน, วันในเดือน) เป็น Date — clamp วันที่เกินสิ้นเดือน เช่น 31 ก.พ. → 28/29
export function resolveScheduledDate(year: number, monthZero: number, dayOfMonth: number): Date {
  const clampedDay = Math.min(Math.max(1, dayOfMonth), lastDayOfMonth(year, monthZero))
  return new Date(year, monthZero, clampedDay)
}

interface PeriodLike {
  id: string
  seq: number
  startDate: Date | null
}

// คำนวณวันครบกำหนดของงานทำซ้ำในแต่ละ period ที่ "ตรงรอบ"
// interval นับจากเดือนของ period แรกที่มี startDate — เช่น interval=2 = เดือนเว้นเดือน
// คืน Map<periodId, scheduledDate> เฉพาะ period ที่เข้าเงื่อนไข
export function deriveRecurrenceOccurrences(
  periods: readonly PeriodLike[],
  rule: RecurrenceRule,
): Map<string, Date> {
  const result = new Map<string, Date>()
  const dated = periods
    .filter((p) => p.startDate != null)
    .sort((a, b) => a.startDate!.getTime() - b.startDate!.getTime())
  if (dated.length === 0) return result

  const base = dated[0].startDate!
  const baseYear = base.getFullYear()
  const baseMonth = base.getMonth()

  for (const period of dated) {
    const d = period.startDate!
    const monthsDiff = (d.getFullYear() - baseYear) * 12 + (d.getMonth() - baseMonth)
    if (monthsDiff < 0) continue
    if (monthsDiff % rule.interval !== 0) continue
    result.set(period.id, resolveScheduledDate(d.getFullYear(), d.getMonth(), rule.dayOfMonth))
  }
  return result
}
