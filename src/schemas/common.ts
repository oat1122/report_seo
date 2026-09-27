import { z } from 'zod'

// ลิงก์ที่ผู้ใช้กรอกแล้วเราเอาไป render เป็น <a href> — allowlist http/https กัน javascript:/data: ฯลฯ
export const httpUrlSchema = z
  .url({ protocol: /^https?$/, error: 'URL ต้องขึ้นต้นด้วย http:// หรือ https://' })
  .max(2000)

// boolean จาก query string — z.coerce.boolean('false') ได้ true จึงใช้ stringbool
// รับ boolean ด้วย เพราะบาง use case parse ซ้ำหลัง withApiHandler parse ไปแล้ว
export const queryBoolean = z.union([z.boolean(), z.stringbool()])
