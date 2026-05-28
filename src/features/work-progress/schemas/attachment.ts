import { z } from 'zod'

const UNSAFE_URL_PROTOCOL = /^(javascript|data|vbscript|file):/i

export const addLinkAttachmentSchema = z.object({
  url: z
    .string()
    .url()
    .max(2000)
    .refine((u) => !UNSAFE_URL_PROTOCOL.test(u), {
      message: 'URL ไม่ปลอดภัย',
    }),
  caption: z.string().max(500).nullable().optional(),
})

export type AddLinkAttachmentInput = z.infer<typeof addLinkAttachmentSchema>

// schema สำหรับ caption ใน multipart upload form
// (file ไม่ผ่าน Zod เพราะ withApiHandler ไม่ parse multipart — caller validate ผ่าน validateUploadFile เอง)
export const uploadAttachmentCaptionSchema = z.string().max(500).nullable().optional()
