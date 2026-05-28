import type { PeriodTypeCode } from '../types'

const THAI_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
] as const

export interface PeriodSeed {
  seq: number
  label: string
  startDate?: Date
  endDate?: Date
}

export interface CustomPeriodInput {
  label: string
  startDate?: Date
  endDate?: Date
}

export interface MonthRangeInput {
  startMonth: number // 1-12
  startYear: number
  endMonth: number // 1-12
  endYear: number
}

// คำนวณจำนวนเดือนรวม (inclusive) ของ range เช่น เม.ย.2029 → เม.ย.2031 = 25 เดือน
export function countMonthsInRange(range: MonthRangeInput): number {
  const totalMonths =
    (range.endYear - range.startYear) * 12 + (range.endMonth - range.startMonth) + 1
  return Math.max(0, totalMonths)
}

// Generate periods แบบเดือนรายเดือนข้ามปีได้ — label "เม.ย. 2029"
export function generateMonthRangePeriods(range: MonthRangeInput): PeriodSeed[] {
  const total = countMonthsInRange(range)
  if (total === 0) return []
  const result: PeriodSeed[] = []
  for (let i = 0; i < total; i++) {
    // month เริ่มจาก startMonth-1 (zero-based) + i, ปรับ year/month overflow ด้วย Date()
    const monthIndexZero = range.startMonth - 1 + i
    const yearOffset = Math.floor(monthIndexZero / 12)
    const monthZero = ((monthIndexZero % 12) + 12) % 12
    const year = range.startYear + yearOffset
    result.push({
      seq: i + 1,
      label: `${THAI_MONTHS[monthZero]} ${year}`,
      startDate: new Date(year, monthZero, 1),
      endDate: new Date(year, monthZero + 1, 0),
    })
  }
  return result
}

// Generate template periods แบบ "เดือนที่ N" (ไม่ผูกปี) — ใช้ใน TemplateBuilder
export function generateTemplateMonthSlots(durationMonths: number): PeriodSeed[] {
  if (!Number.isInteger(durationMonths) || durationMonths < 1) return []
  return Array.from({ length: durationMonths }, (_, i) => ({
    seq: i + 1,
    label: `เดือนที่ ${i + 1}`,
  }))
}

// Legacy generator — รองรับ periodType + year (ของเดิม, ใช้กับ legacy plan/template ที่ไม่ได้ระบุช่วง)
export function generatePeriods(
  type: PeriodTypeCode,
  options: { year?: number; customPeriods?: readonly CustomPeriodInput[] } = {},
): PeriodSeed[] {
  switch (type) {
    case 'YEAR_12_MONTHS':
      return THAI_MONTHS.map((label, i) => ({
        seq: i + 1,
        label: options.year ? `${label} ${options.year}` : label,
        startDate: options.year ? new Date(options.year, i, 1) : undefined,
        // วันสุดท้ายของเดือน = day 0 ของเดือนถัดไป
        endDate: options.year ? new Date(options.year, i + 1, 0) : undefined,
      }))
    case 'YEAR_4_QUARTERS':
      return [1, 2, 3, 4].map((q) => ({
        seq: q,
        label: options.year ? `Q${q}/${options.year}` : `Q${q}`,
        startDate: options.year ? new Date(options.year, (q - 1) * 3, 1) : undefined,
        endDate: options.year ? new Date(options.year, q * 3, 0) : undefined,
      }))
    case 'HALF_2_PERIODS':
      return [1, 2].map((h) => ({
        seq: h,
        label: options.year ? `H${h}/${options.year}` : `H${h}`,
        startDate: options.year ? new Date(options.year, (h - 1) * 6, 1) : undefined,
        endDate: options.year ? new Date(options.year, h * 6, 0) : undefined,
      }))
    case 'CUSTOM':
      return (options.customPeriods ?? []).map((p, i) => ({
        seq: i + 1,
        label: p.label,
        startDate: p.startDate,
        endDate: p.endDate,
      }))
  }
}
