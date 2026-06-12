/**
 * วันที่ปัจจุบันตามโซนเวลาไทย (Asia/Bangkok) รูปแบบ YYYY-MM-DD
 * ใช้เป็นพารามิเตอร์ `date` ของ Ahrefs API (ต้องตรงวันที่ฝั่งไทยไม่ใช่ UTC)
 * en-CA locale ให้รูปแบบ ISO `YYYY-MM-DD` เสมอ
 */
export function bangkokToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date())
}
