// ตัวช่วยแสดงผลของหน้า Work Progress (ฝั่ง UI ล้วน ไม่มี logic ธุรกิจ)

export const PERIOD_LABEL: Record<string, string> = {
  YEAR_12_MONTHS: '12 เดือน',
  YEAR_4_QUARTERS: '4 ไตรมาส',
  HALF_2_PERIODS: 'ครึ่งปี',
  CUSTOM: 'กำหนดเอง',
}

import { THAI_MONTHS } from '../../../domain/policies/period-generator'

export { THAI_MONTHS }

type DateLike = Date | string | null | undefined

function toDate(d: DateLike): Date | null {
  if (d == null) return null
  const date = typeof d === 'string' ? new Date(d) : d
  return Number.isNaN(date.getTime()) ? null : date
}

// วันที่แบบ "2 ก.ย. 2026" — ปี ค.ศ. ตามกฎ UI Kit
export { formatDateCE as formatThaiDate } from '@/lib/date'

// ช่วงของแผน: "ม.ค. – ธ.ค. 2026" · ข้ามปี "ต.ค. 2025 – ก.ย. 2026" · ไม่มีช่วง → ปี หรือ null
export function formatPlanRange(plan: {
  startDate: DateLike
  endDate: DateLike
  year: number | null
}): string | null {
  const s = toDate(plan.startDate)
  const e = toDate(plan.endDate)
  if (s && e) {
    const sm = THAI_MONTHS[s.getMonth()]
    const em = THAI_MONTHS[e.getMonth()]
    return s.getFullYear() === e.getFullYear()
      ? `${sm} – ${em} ${e.getFullYear()}`
      : `${sm} ${s.getFullYear()} – ${em} ${e.getFullYear()}`
  }
  return plan.year ? String(plan.year) : null
}

// period ที่ครอบวันนี้ — ใช้ไฮไลต์คอลัมน์ "เดือนนี้"
export function isCurrentPeriod(
  period: { startDate: DateLike; endDate: DateLike },
  now: Date,
): boolean {
  const s = toDate(period.startDate)
  const e = toDate(period.endDate)
  if (!s || !e) return false
  const end = new Date(e)
  end.setHours(23, 59, 59, 999)
  return now >= s && now <= end
}

// "เม.ย. 2029" → ["เม.ย.", "2029"] ให้หัวคอลัมน์แคบแสดงสองบรรทัด
export function splitPeriodLabel(label: string): [string, string] {
  const i = label.indexOf(' ')
  return i < 0 ? [label, ''] : [label.slice(0, i), label.slice(i + 1)]
}

// สีจาก master data (hex) → เลือกตัวอักษรขาวหรือดำให้อ่านออกบนพื้นสีนั้น
export function onColorTextClass(color: string | null | undefined): string {
  const hex = color?.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1]
  if (!hex) return 'text-white'
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(full.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  // จุดตัดที่ contrast กับขาวและดำเท่ากัน ≈ 0.179
  return luminance > 0.179 ? 'text-black/85' : 'text-white'
}

// พื้นอ่อนของสีสถานะ (chip) — ผสมกับโปร่งใสให้ใช้ได้ทั้งโหมดสว่าง/มืด
export function tintOf(color: string | null | undefined, percent = 18): string | undefined {
  if (!color) return undefined
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`
}
