import { z } from 'zod'

// PIN gate ของปุ่ม "ซิงก์ Ahrefs ทั้งหมด" — verify ฝั่ง server กับ process.env.PIN_Ahrefs_SYNC
export const ahrefsSyncPinSchema = z.object({
  pin: z.string().min(1, 'กรุณากรอก PIN'),
})

export type AhrefsSyncPinInput = z.infer<typeof ahrefsSyncPinSchema>
