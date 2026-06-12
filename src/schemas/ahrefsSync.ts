import { z } from 'zod'

// PIN gate ของปุ่ม "ซิงก์ Ahrefs ทั้งหมด" — verify ฝั่ง server กับ process.env.PIN_Ahrefs_SYNC
export const ahrefsSyncPinSchema = z.object({
  pin: z.string().min(1, 'กรุณากรอก PIN'),
})

export type AhrefsSyncPinInput = z.infer<typeof ahrefsSyncPinSchema>

// 6 ค่าที่ดึงจาก Ahrefs มาเสนอ — healthScore = null เมื่อไม่มี Site Audit project
export const ahrefsFullMetricsSchema = z.object({
  domainRating: z.number().int().min(0),
  organicTraffic: z.number().int().min(0),
  organicKeywords: z.number().int().min(0),
  backlinks: z.number().int().min(0),
  refDomains: z.number().int().min(0),
  healthScore: z.number().int().min(0).max(100).nullable(),
})

export type AhrefsFullMetrics = z.infer<typeof ahrefsFullMetricsSchema>

// payload ของ notification ข้อเสนออัปเดตค่า Ahrefs — ใช้ parse metadata ฝั่ง client ก่อนเปิด dialog
export const ahrefsProposalMetadataSchema = z.object({
  kind: z.literal('ahrefs-metrics-proposal'),
  customerUserId: z.uuid(),
  customerName: z.string(),
  domain: z.string(),
  proposed: ahrefsFullMetricsSchema,
  fetchedAt: z.string(),
})

export type AhrefsProposalMetadata = z.infer<typeof ahrefsProposalMetadataSchema>
