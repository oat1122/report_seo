import { z } from 'zod'
import { httpUrlSchema } from '@/schemas/common'

export const BLOG_STAGE_CODES = [
  'SUBMIT_TOPIC',
  'CLIENT_FEEDBACK_TOPIC',
  'SUBMIT_ARTICLE',
  'CLIENT_FEEDBACK_ARTICLE',
  'SUBMIT_FINAL',
] as const

/** ชื่อ field ของไฟล์ใน multipart ตอนส่งงาน — ฝั่ง hook กับ route handler ต้องใช้ตัวเดียวกัน */
export const BLOG_FILE_FIELDS = {
  ARTICLE_DOC: 'articleDoc',
  COVER_IMAGE: 'coverImage',
} as const

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
    publishedUrl: httpUrlSchema.nullable(),
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
 * เพดานข้อความที่คุยกันในบทความ (ส่งงาน / ขอแก้ไข) — คอลัมน์เป็น MySQL TEXT = 65,535 ไบต์
 * ตัวอักษรไทยกิน 3 ไบต์ อิโมจิ 4 ไบต์ จึงตั้งไว้ 15,000 ตัวให้ปลอดภัยแม้กรณีแย่สุด
 */
export const BLOG_MESSAGE_MAX_LENGTH = 15_000

/**
 * เนื้อหาที่ส่งให้ลูกค้า 1 รอบ — ไฟล์มาทาง multipart จึงไม่อยู่ใน schema
 * use case เป็นคนบังคับว่าต้องมีอย่างน้อย 1 อย่าง (ข้อความ / ลิงก์ / ไฟล์)
 * และต้องแนบไฟล์ครบตาม requiredFileKinds ของ stage นั้น
 */
export const submitStageWorkSchema = z.object({
  message: z.string().trim().max(BLOG_MESSAGE_MAX_LENGTH).nullable().default(null),
  linkUrl: httpUrlSchema.nullable().default(null),
})

export const submitFeedbackSchema = z.object({
  stageCode: stageCodeSchema,
  decision: z.enum(['APPROVED', 'CHANGES_REQUESTED']),
  comment: z.string().trim().max(BLOG_MESSAGE_MAX_LENGTH).nullable().default(null),
})

/** ข้อความที่ลูกค้าทักไปหาทีมเขียน — ส่งเป็น notification ไม่ได้เก็บเป็น thread */
export const messageWriterSchema = z.object({
  message: z.string().trim().min(1).max(1000),
})

export const updateBlogSettingsSchema = z
  .object({
    articlesPerMonth: z.coerce.number().int().min(0).max(100),
    blogWriterId: z.uuid().nullable(),
    blogRequiresApproval: z.boolean(),
  })
  .partial()

export type ListArticlesQuery = z.infer<typeof listArticlesQuerySchema>
export type CreateArticleInput = z.infer<typeof createArticleSchema>
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>
export type UpdateStageInput = z.infer<typeof updateStageSchema>
export type SubmitStageWorkInput = z.infer<typeof submitStageWorkSchema>
export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>
export type MessageWriterInput = z.infer<typeof messageWriterSchema>
export type ArticleKeywordInput = z.infer<typeof articleKeywordInputSchema>
export type UpdateBlogSettingsInput = z.infer<typeof updateBlogSettingsSchema>
