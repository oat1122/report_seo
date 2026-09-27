// Formatters สำหรับ UI รายงาน — ปี ค.ศ. เสมอ (Handoff rule 8: "28 ก.ย. 2026", "08:00 น.")
// th-TH ปกติได้ปี พ.ศ. → บังคับ calendar gregory

const numberFmt = new Intl.NumberFormat('th-TH')

/** "28 ก.ย. 2026" */
export { formatDateCE } from '@/lib/date'

/** "08:00 น." */
export const formatTimeTH = (date: Date | string | number): string => {
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} น.`
}

/** "12,480" */
export const formatNumber = (value: number): string => numberFmt.format(Math.round(value))

/** "12.5K" / "1.2M" — ป้ายแกน/ค่าบนแท่ง */
export const formatCompact = (value: number): string => {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return `${Math.round(value)}`
}

/** "+18.4%" / "-3.0%" */
export const formatSignedPct = (value: number, digits = 1): string =>
  `${value >= 0 ? '+' : '-'}${Math.abs(value).toFixed(digits)}%`
