import { describe, expect, it } from 'vitest'
import {
  createArticleSchema,
  listArticlesQuerySchema,
  messageWriterSchema,
  submitFeedbackSchema,
  submitStageWorkSchema,
  updateArticleSchema,
  updateBlogSettingsSchema,
  updateStageSchema,
} from '..'

describe('listArticlesQuerySchema', () => {
  it('coerce query string เป็นตัวเลข — searchParams ส่งมาเป็น string เสมอ', () => {
    expect(listArticlesQuerySchema.parse({ year: '2026', month: '8' })).toEqual({
      year: 2026,
      month: 8,
    })
  })

  it('เดือนนอกช่วง 1–12 ไม่ผ่าน', () => {
    expect(listArticlesQuerySchema.safeParse({ month: '13' }).success).toBe(false)
    expect(listArticlesQuerySchema.safeParse({ month: '0' }).success).toBe(false)
  })

  it('ไม่ส่งอะไรมาเลย = ไม่ filter', () => {
    expect(listArticlesQuerySchema.parse({})).toEqual({})
  })
})

describe('createArticleSchema', () => {
  const minimal = { title: '  หัวข้อบทความ  ', targetYear: '2026', targetMonth: '8' }

  it('เติม default ให้ field ที่ไม่ได้ส่งมา และ trim/coerce ให้พร้อมลง DB', () => {
    expect(createArticleSchema.parse(minimal)).toEqual({
      title: 'หัวข้อบทความ',
      keyFocus: null,
      targetYear: 2026,
      targetMonth: 8,
      startDate: null,
      note: null,
      keywords: [],
    })
  })

  it('title ว่าง (หรือมีแต่ช่องว่าง) ไม่ผ่าน', () => {
    expect(createArticleSchema.safeParse({ ...minimal, title: '   ' }).success).toBe(false)
  })

  it('coerce startDate เป็น Date', () => {
    const parsed = createArticleSchema.parse({ ...minimal, startDate: '2026-08-01' })
    expect(parsed.startDate).toBeInstanceOf(Date)
  })

  it('keyword เติม source/sourceId เป็นค่า default ให้เอง', () => {
    const parsed = createArticleSchema.parse({ ...minimal, keywords: [{ keyword: ' seo ' }] })
    expect(parsed.keywords).toEqual([{ keyword: 'seo', source: 'MANUAL', sourceId: null }])
  })

  it('keyword เกิน 20 ตัวไม่ผ่าน', () => {
    const keywords = Array.from({ length: 21 }, (_, i) => ({ keyword: `kw-${i}` }))
    expect(createArticleSchema.safeParse({ ...minimal, keywords }).success).toBe(false)
  })
})

describe('updateArticleSchema', () => {
  it('partial — ส่งมาแค่ field เดียวก็ผ่าน', () => {
    expect(updateArticleSchema.parse({ note: ' บันทึก ' })).toEqual({ note: 'บันทึก' })
  })

  it('publishedUrl ต้องเป็น URL จริง', () => {
    expect(updateArticleSchema.safeParse({ publishedUrl: 'ไม่ใช่ url' }).success).toBe(false)
    expect(updateArticleSchema.safeParse({ publishedUrl: 'https://example.com/a' }).success).toBe(
      true,
    )
    expect(updateArticleSchema.safeParse({ publishedUrl: null }).success).toBe(true)
  })

  it('title เกิน 500 ตัวไม่ผ่าน', () => {
    expect(updateArticleSchema.safeParse({ title: 'ก'.repeat(501) }).success).toBe(false)
  })
})

describe('updateStageSchema', () => {
  it('partial ทุก field และ coerce dueDate เป็น Date', () => {
    expect(updateStageSchema.parse({})).toEqual({})
    expect(updateStageSchema.parse({ dueDate: '2026-08-10' }).dueDate).toBeInstanceOf(Date)
    expect(updateStageSchema.parse({ submitted: false })).toEqual({ submitted: false })
  })
})

describe('submitStageWorkSchema', () => {
  it('ไม่ส่งอะไรมา = null ทั้งคู่ (use case เป็นคนบังคับว่าต้องมีอย่างน้อย 1 อย่าง)', () => {
    expect(submitStageWorkSchema.parse({})).toEqual({ message: null, linkUrl: null })
  })

  it('linkUrl ต้องเป็น URL จริง', () => {
    expect(submitStageWorkSchema.safeParse({ linkUrl: 'docs.google.com' }).success).toBe(false)
    expect(submitStageWorkSchema.safeParse({ linkUrl: 'https://docs.google.com/x' }).success).toBe(
      true,
    )
  })
})

describe('submitFeedbackSchema', () => {
  it('รับเฉพาะ stage code และ decision ที่รู้จัก', () => {
    expect(
      submitFeedbackSchema.parse({ stageCode: 'CLIENT_FEEDBACK_TOPIC', decision: 'APPROVED' }),
    ).toEqual({ stageCode: 'CLIENT_FEEDBACK_TOPIC', decision: 'APPROVED', comment: null })

    expect(
      submitFeedbackSchema.safeParse({ stageCode: 'UNKNOWN', decision: 'APPROVED' }).success,
    ).toBe(false)
    expect(
      submitFeedbackSchema.safeParse({ stageCode: 'SUBMIT_TOPIC', decision: 'MAYBE' }).success,
    ).toBe(false)
  })
})

describe('messageWriterSchema', () => {
  it('ข้อความว่างหลัง trim ไม่ผ่าน', () => {
    expect(messageWriterSchema.safeParse({ message: '   ' }).success).toBe(false)
    expect(messageWriterSchema.parse({ message: ' ขอสอบถาม ' })).toEqual({ message: 'ขอสอบถาม' })
  })
})

describe('updateBlogSettingsSchema', () => {
  it('coerce จำนวนบทความต่อเดือน และรับ 0 ได้ (พักงานเขียนชั่วคราว)', () => {
    expect(updateBlogSettingsSchema.parse({ articlesPerMonth: '0' })).toEqual({
      articlesPerMonth: 0,
    })
  })

  it('blogWriterId ต้องเป็น uuid หรือ null', () => {
    expect(updateBlogSettingsSchema.safeParse({ blogWriterId: 'not-a-uuid' }).success).toBe(false)
    expect(updateBlogSettingsSchema.safeParse({ blogWriterId: null }).success).toBe(true)
  })
})
