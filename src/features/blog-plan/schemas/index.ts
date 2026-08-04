import { z } from 'zod'

export const BLOG_STAGE_CODES = [
  'SUBMIT_TOPIC',
  'CLIENT_FEEDBACK_TOPIC',
  'SUBMIT_ARTICLE',
  'CLIENT_FEEDBACK_ARTICLE',
  'SUBMIT_ARTWORK',
  'CLIENT_FINAL_APPROVAL',
  'UPLOAD_ON_WEBSITE',
] as const

const stageCodeSchema = z.enum(BLOG_STAGE_CODES)
const keywordSourceSchema = z.enum(['REPORT', 'RECOMMEND', 'MANUAL'])

export const articleKeywordInputSchema = z.object({
  keyword: z.string().trim().min(1).max(191),
  source: keywordSourceSchema.default('MANUAL'),
  sourceId: z.uuid().nullable().default(null),
})

export const listArticlesQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
})

export const createArticleSchema = z.object({
  title: z.string().trim().min(1).max(500),
  keyFocus: z.string().trim().max(191).nullable().default(null),
  targetYear: z.coerce.number().int().min(2000).max(2100),
  targetMonth: z.coerce.number().int().min(1).max(12),
  startDate: z.coerce.date().nullable().default(null),
  note: z.string().trim().max(5000).nullable().default(null),
  keywords: z.array(articleKeywordInputSchema).max(20).default([]),
})

export const updateArticleSchema = z
  .object({
    title: z.string().trim().min(1).max(500),
    keyFocus: z.string().trim().max(191).nullable(),
    targetYear: z.coerce.number().int().min(2000).max(2100),
    targetMonth: z.coerce.number().int().min(1).max(12),
    startDate: z.coerce.date().nullable(),
    publishedUrl: z.url().max(2000).nullable(),
    note: z.string().trim().max(5000).nullable(),
    orderIndex: z.coerce.number().int().min(0),
    keywords: z.array(articleKeywordInputSchema).max(20),
  })
  .partial()

export const updateStageSchema = z
  .object({
    dueDate: z.coerce.date().nullable(),
    note: z.string().trim().max(2000).nullable(),
    /** true = ทำเครื่องหมายว่าส่งงานแล้ว, false = ยกเลิกการส่ง */
    submitted: z.boolean(),
  })
  .partial()

/**
 * เนื้อหาที่ส่งให้ลูกค้า 1 รอบ — ไฟล์มาทาง multipart จึงไม่อยู่ใน schema
 * use case เป็นคนบังคับว่าต้องมีอย่างน้อย 1 อย่าง (ข้อความ / ลิงก์ / ไฟล์)
 */
export const submitStageWorkSchema = z.object({
  message: z.string().trim().max(5000).nullable().default(null),
  linkUrl: z.url().max(2000).nullable().default(null),
})

export const submitFeedbackSchema = z.object({
  stageCode: stageCodeSchema,
  decision: z.enum(['APPROVED', 'CHANGES_REQUESTED']),
  comment: z.string().trim().max(5000).nullable().default(null),
})

export const updateBlogSettingsSchema = z
  .object({
    articlesPerMonth: z.coerce.number().int().min(0).max(100),
    blogWriterId: z.uuid().nullable(),
  })
  .partial()

export type ListArticlesQuery = z.infer<typeof listArticlesQuerySchema>
export type CreateArticleInput = z.infer<typeof createArticleSchema>
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>
export type UpdateStageInput = z.infer<typeof updateStageSchema>
export type SubmitStageWorkInput = z.infer<typeof submitStageWorkSchema>
export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>
export type ArticleKeywordInput = z.infer<typeof articleKeywordInputSchema>
export type UpdateBlogSettingsInput = z.infer<typeof updateBlogSettingsSchema>
