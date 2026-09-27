import { z } from 'zod'
import { httpUrlSchema } from '@/schemas/common'

export const addLinkAttachmentSchema = z.object({
  url: httpUrlSchema,
  caption: z.string().max(500).nullable().optional(),
})

export type AddLinkAttachmentInput = z.infer<typeof addLinkAttachmentSchema>

// schema สำหรับ caption ใน multipart upload form
// (file ไม่ผ่าน Zod เพราะ withApiHandler ไม่ parse multipart — caller validate ผ่าน validateUploadFile เอง)
export const uploadAttachmentCaptionSchema = z.string().max(500).nullable().optional()
