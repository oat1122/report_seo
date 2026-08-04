/**
 * วันที่ปัจจุบันตามโซนเวลาไทย (Asia/Bangkok) รูปแบบ YYYY-MM-DD
 * ใช้เป็นพารามิเตอร์ `date` ของ Ahrefs API (ต้องตรงวันที่ฝั่งไทยไม่ใช่ UTC)
 * en-CA locale ให้รูปแบบ ISO `YYYY-MM-DD` เสมอ
 */
export function bangkokToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date())
}

/** วันที่แบบสั้นภาษาไทยสำหรับตาราง/timeline — คืน '—' เมื่อยังไม่กำหนด */
export function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  })
}

/** ค่าเริ่มต้นของ <input type="date"> — คืน '' เมื่อไม่มีค่า */
export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return ''
  return new Date(date).toISOString().slice(0, 10)
}
