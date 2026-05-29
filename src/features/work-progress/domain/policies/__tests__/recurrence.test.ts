import { describe, it, expect } from 'vitest'
import {
  deriveRecurrenceOccurrences,
  readItemRecurrence,
  resolveScheduledDate,
} from '../recurrence'

function recItem(
  over: Partial<{
    isRecurring: boolean
    recurrenceFreq: string | null
    recurrenceInterval: number
    recurrenceDayOfMonth: number | null
  }> = {},
) {
  return {
    isRecurring: true,
    recurrenceFreq: 'MONTHLY',
    recurrenceInterval: 1,
    recurrenceDayOfMonth: 14,
    ...over,
  }
}

// สร้าง period รายเดือนเริ่ม ม.ค. ปีที่กำหนด
function monthlyPeriods(year: number, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    seq: i + 1,
    startDate: new Date(year, i, 1),
  }))
}

describe('resolveScheduledDate', () => {
  it('คืนวันตรงตามที่ระบุเมื่ออยู่ในเดือน', () => {
    const d = resolveScheduledDate(2026, 4, 14) // พ.ค. 2026
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(4)
    expect(d.getDate()).toBe(14)
  })

  it('clamp วันที่เกินสิ้นเดือน — 31 ก.พ. (ปีปกติ) → 28', () => {
    const d = resolveScheduledDate(2026, 1, 31) // ก.พ. 2026 (ไม่ใช่อธิกสุรทิน)
    expect(d.getMonth()).toBe(1)
    expect(d.getDate()).toBe(28)
  })

  it('clamp วันที่เกินสิ้นเดือน — 31 ก.พ. (ปีอธิกสุรทิน) → 29', () => {
    const d = resolveScheduledDate(2024, 1, 31) // ก.พ. 2024 (อธิกสุรทิน)
    expect(d.getDate()).toBe(29)
  })
})

describe('readItemRecurrence', () => {
  it('คืนกฎเมื่อข้อมูลครบ', () => {
    expect(readItemRecurrence(recItem())).toEqual({
      freq: 'MONTHLY',
      interval: 1,
      dayOfMonth: 14,
    })
  })

  it('คืน null เมื่อไม่ได้เปิด recurring', () => {
    expect(readItemRecurrence(recItem({ isRecurring: false }))).toBeNull()
  })

  it('คืน null เมื่อ freq ไม่ใช่ MONTHLY', () => {
    expect(readItemRecurrence(recItem({ recurrenceFreq: 'WEEKLY' }))).toBeNull()
  })

  it('คืน null เมื่อไม่ระบุวันในเดือน', () => {
    expect(readItemRecurrence(recItem({ recurrenceDayOfMonth: null }))).toBeNull()
  })

  it('interval < 1 → ถูกปรับเป็น 1', () => {
    expect(readItemRecurrence(recItem({ recurrenceInterval: 0 }))?.interval).toBe(1)
  })
})

describe('deriveRecurrenceOccurrences', () => {
  it('interval=1 → ครบทุกเดือน วันเดียวกัน', () => {
    const periods = monthlyPeriods(2026, 12)
    const occ = deriveRecurrenceOccurrences(periods, {
      freq: 'MONTHLY',
      interval: 1,
      dayOfMonth: 14,
    })
    expect(occ.size).toBe(12)
    for (const period of periods) {
      const d = occ.get(period.id)!
      expect(d.getDate()).toBe(14)
      expect(d.getMonth()).toBe(period.seq - 1)
    }
  })

  it('interval=2 → เดือนเว้นเดือนจากเดือนแรก', () => {
    const periods = monthlyPeriods(2026, 12)
    const occ = deriveRecurrenceOccurrences(periods, {
      freq: 'MONTHLY',
      interval: 2,
      dayOfMonth: 1,
    })
    expect(occ.size).toBe(6)
    expect(occ.has('p1')).toBe(true) // ม.ค.
    expect(occ.has('p2')).toBe(false) // ก.พ.
    expect(occ.has('p3')).toBe(true) // มี.ค.
  })

  it('ข้าม period ที่ไม่มี startDate', () => {
    const periods = [
      { id: 'a', seq: 1, startDate: null },
      { id: 'b', seq: 2, startDate: new Date(2026, 5, 1) },
    ]
    const occ = deriveRecurrenceOccurrences(periods, {
      freq: 'MONTHLY',
      interval: 1,
      dayOfMonth: 10,
    })
    expect(occ.has('a')).toBe(false)
    expect(occ.get('b')!.getDate()).toBe(10)
  })
})
