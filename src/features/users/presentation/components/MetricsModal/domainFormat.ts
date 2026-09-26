import type React from 'react'

// วันที่แบบไทยปี ค.ศ. (rule 8) — "28 ก.ย. 2026"
const thaiDateFormatter = new Intl.DateTimeFormat('th-TH-u-ca-gregory', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export const formatThaiDate = (date: Date | string | number) =>
  thaiDateFormatter.format(new Date(date))

/** ตัวเลขค่าโดเมน/keyword — คั่นหลักพัน ทศนิยมไม่เกิน 1 ตำแหน่ง · ไม่มีค่า = '—' */
export const formatMetric = (value: number | null | undefined) =>
  value === null || value === undefined || Number.isNaN(value)
    ? '—'
    : value.toLocaleString('en-US', { maximumFractionDigits: 1 })

/**
 * handler ของฟอร์ม keyword (useMetricsModal) รับ ChangeEvent ของ input
 * — Checkbox/Switch ของ radix ไม่มี event แบบนั้น จึงสร้าง event จำลองที่มีแค่ field ที่ handler อ่าน
 */
export const checkboxChangeEvent = (name: string, checked: boolean) =>
  ({
    target: { name, type: 'checkbox', checked, value: '' },
  }) as unknown as React.ChangeEvent<HTMLInputElement>

/** dialog บนมือถือ = bottom sheet (rule 11) — ใช้ต่อท้าย className ของ DialogContent / AlertDialogContent */
export const MOBILE_SHEET_CLASS =
  'max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:max-h-[92dvh] max-sm:max-w-none! max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:data-open:slide-in-from-bottom-8'

/** อันดับ keyword — ไม่มีอันดับ (null/0) แสดง '—' */
export const formatPosition = (position: number | null) =>
  position && position > 0 ? `#${position}` : '—'
