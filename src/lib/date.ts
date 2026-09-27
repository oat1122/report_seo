/**
 * วันที่ปัจจุบันตามโซนเวลาไทย (Asia/Bangkok) รูปแบบ YYYY-MM-DD
 * ใช้เป็นพารามิเตอร์ `date` ของ Ahrefs API (ต้องตรงวันที่ฝั่งไทยไม่ใช่ UTC)
 * en-CA locale ให้รูปแบบ ISO `YYYY-MM-DD` เสมอ
 */
export function bangkokToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date())
}

// ปี ค.ศ. เสมอตามกฎ UI Kit (th-TH ปกติได้ พ.ศ. → บังคับ calendar gregory)
const CE_DATE = new Intl.DateTimeFormat('th-TH-u-ca-gregory', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** "28 ก.ย. 2026" — ไม่มีค่า/วันที่พัง = '—' · ตัวเดียวของทั้งระบบ (feature ต่าง ๆ alias ชื่อเอง) */
export function formatDateCE(date: Date | string | number | null | undefined): string {
  if (date == null || date === '') return '—'
  const d = new Date(date)
  return Number.isNaN(d.getTime()) ? '—' : CE_DATE.format(d)
}

/** วันที่สำหรับตาราง/timeline — เดิมออกปี พ.ศ. 2 หลัก ขัดกฎ ค.ศ. ของ UI Kit จึงใช้ตัวเดียวกัน */
export const formatShortDate = formatDateCE

/** ค่าเริ่มต้นของ <input type="date"> — คืน '' เมื่อไม่มีค่า */
export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return ''
  return new Date(date).toISOString().slice(0, 10)
}
