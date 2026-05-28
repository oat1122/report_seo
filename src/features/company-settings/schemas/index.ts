import { z } from 'zod'

export const companySettingsSchema = z.object({
  name: z.string().trim().min(1, 'กรุณาระบุชื่อบริษัท'),
  address: z.string().trim().min(1, 'กรุณาระบุที่อยู่'),
  taxId: z.string().trim().min(1, 'กรุณาระบุเลขผู้เสียภาษี'),
  phone: z.string().trim().nullable().optional(),
  email: z.string().email('อีเมลไม่ถูกต้อง').nullable().optional(),
})

export type CompanySettingsFormInput = z.infer<typeof companySettingsSchema>
