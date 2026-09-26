/**
 * ชื่อไฟล์บนดิสก์ถูกต่อท้ายด้วย `_<timestamp>_<uuid8>` กัน collision (ดู sanitizeFilename)
 * ไฟล์นี้แยกจาก infrastructure/upload/validators.ts เพราะ client component ต้อง import ได้
 * โดยไม่ลาก node builtin (crypto / file-type) ติดเข้า bundle
 */

// ต้องตรงกับรูปแบบที่ sanitizeFilename สร้าง — มี round-trip test คุมไว้
const UNIQUE_SUFFIX = /_\d{13}_[0-9a-f]{8}(?=\.[^.]*$|$)/

/** ตัด suffix กัน collision ออกเพื่อโชว์ให้คนอ่าน — ชื่อเก่าที่ไม่มี suffix คืนค่าเดิม */
export function displayFilename(filename: string): string {
  return filename.replace(UNIQUE_SUFFIX, '')
}
