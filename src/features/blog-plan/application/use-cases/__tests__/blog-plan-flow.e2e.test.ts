// e2e ระดับ use case — wire use case จริงเข้ากับ fake ที่ implement port ครบ
// ไล่ pipeline ทั้ง 7 ขั้นรวมรอบ "ลูกค้าขอแก้แล้วทีมส่งใหม่" เพื่อกันสถานะเพี้ยนระหว่างขั้น

import { beforeEach, describe, expect, it } from 'vitest'
import { createArticleUseCase } from '../createArticle'
import { submitClientFeedbackUseCase } from '../submitClientFeedback'
import { submitStageWorkUseCase } from '../submitStageWork'
import type { BlogArticleStatus, BlogStageCode } from '../../../domain/BlogArticle'
import {
  AUTHOR_ID,
  CUSTOMER_ID,
  FakeBlogFileStorage,
  InMemoryBlogArticleRepository,
  fakeFile,
} from './fakes'

describe('blog-plan pipeline (e2e)', () => {
  let articles: InMemoryBlogArticleRepository
  let storage: FakeBlogFileStorage
  let articleId: string

  const submitWork = (stageCode: BlogStageCode, message: string, file: File | null = null) =>
    submitStageWorkUseCase(articles, storage)(
      articleId,
      CUSTOMER_ID,
      stageCode,
      { message, linkUrl: null },
      file,
      AUTHOR_ID,
    )

  const respond = (
    stageCode: BlogStageCode,
    decision: 'APPROVED' | 'CHANGES_REQUESTED',
    comment: string,
  ) =>
    submitClientFeedbackUseCase(articles)(
      articleId,
      CUSTOMER_ID,
      { stageCode, decision, comment },
      'client-user',
    )

  const currentStatus = (): BlogArticleStatus => {
    const article = articles.articles.find((row) => row.id === articleId)
    if (!article) throw new Error('e2e: article หาย')
    return article.status
  }

  beforeEach(async () => {
    articles = new InMemoryBlogArticleRepository()
    storage = new FakeBlogFileStorage()

    const article = await createArticleUseCase(articles)(
      CUSTOMER_ID,
      {
        title: 'วิธีเลือกบริษัทรับทำ SEO',
        keyFocus: 'รับทำ SEO',
        targetYear: 2026,
        targetMonth: 8,
        startDate: new Date('2026-08-01T00:00:00.000Z'),
        note: null,
        keywords: [{ keyword: 'รับทำ SEO', source: 'REPORT', sourceId: null }],
      },
      AUTHOR_ID,
    )
    articleId = article.id
  })

  it('เดินครบตั้งแต่ร่างจนขึ้นเว็บ และสถานะตรงทุกขั้น', async () => {
    expect(currentStatus()).toBe('DRAFT')

    // ทีมเขียนเสนอหัวข้อรอบแรก
    expect((await submitWork('SUBMIT_TOPIC', 'เสนอ 3 หัวข้อ', fakeFile())).status).toBe(
      'WAITING_CLIENT',
    )

    // ลูกค้าขอแก้ → ย้อนกลับไปที่ทีมเขียน ยังไม่มีอะไรค้างส่ง จึงกลับเป็นร่าง
    expect(
      (await respond('CLIENT_FEEDBACK_TOPIC', 'CHANGES_REQUESTED', 'ขอหัวข้ออื่น')).status,
    ).toBe('DRAFT')

    // ส่งใหม่รอบ 2 ใน stage เดิม
    const resubmit = await submitWork('SUBMIT_TOPIC', 'ปรับหัวข้อตามที่ขอ')
    expect(resubmit.round).toBe(2)
    expect(resubmit.status).toBe('WAITING_CLIENT')

    expect((await respond('CLIENT_FEEDBACK_TOPIC', 'APPROVED', 'เอาหัวข้อที่ 2')).status).toBe(
      'IN_PROGRESS',
    )

    expect((await submitWork('SUBMIT_ARTICLE', 'บทความฉบับเต็ม', fakeFile())).status).toBe(
      'WAITING_CLIENT',
    )
    expect((await respond('CLIENT_FEEDBACK_ARTICLE', 'APPROVED', 'อ่านแล้วโอเค')).status).toBe(
      'IN_PROGRESS',
    )

    expect((await submitWork('SUBMIT_ARTWORK', 'ภาพปก', fakeFile('cover.png'))).status).toBe(
      'WAITING_CLIENT',
    )

    // อนุมัติขั้นสุดท้ายแล้วแต่ยังไม่ขึ้นเว็บ = APPROVED ไม่ใช่ PUBLISHED
    expect((await respond('CLIENT_FINAL_APPROVAL', 'APPROVED', 'อนุมัติ')).status).toBe('APPROVED')

    expect((await submitWork('UPLOAD_ON_WEBSITE', 'ขึ้นเว็บแล้ว')).status).toBe('PUBLISHED')
    expect(currentStatus()).toBe('PUBLISHED')
  })

  it('เก็บประวัติครบทุกรอบ — ส่งซ้ำไม่ทับของเดิม', async () => {
    await submitWork('SUBMIT_TOPIC', 'รอบแรก', fakeFile())
    await respond('CLIENT_FEEDBACK_TOPIC', 'CHANGES_REQUESTED', 'ขอแก้')
    await submitWork('SUBMIT_TOPIC', 'รอบสอง', fakeFile())
    await respond('CLIENT_FEEDBACK_TOPIC', 'APPROVED', 'ผ่าน')

    const article = articles.articles.find((row) => row.id === articleId)
    const topicSubmissions =
      article?.submissions.filter((s) => s.stageCode === 'SUBMIT_TOPIC') ?? []

    expect(topicSubmissions.map((s) => s.round)).toEqual([1, 2])
    expect(topicSubmissions.flatMap((s) => s.files).map((f) => f.version)).toEqual([1, 2])
    expect(article?.feedbacks[0].decision).toBe('APPROVED')
    expect(article?.feedbacks).toHaveLength(2)
  })

  it('ข้ามขั้นไม่ได้ — ลูกค้าตอบขั้นที่ทีมยังไม่ส่งไม่ได้', async () => {
    await expect(respond('CLIENT_FEEDBACK_ARTICLE', 'APPROVED', 'ขอผ่านเลย')).rejects.toThrow(
      'ยังไม่มีงานส่งมาให้พิจารณาในขั้นตอนนี้',
    )
  })
})
