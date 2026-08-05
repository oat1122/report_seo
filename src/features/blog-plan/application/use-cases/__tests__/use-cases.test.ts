import { describe, expect, it, vi } from 'vitest'
import { BadRequestError, NotFoundError } from '@/lib/errors'
import { createArticleUseCase, dedupeKeywords } from '../createArticle'
import { deleteArticleUseCase } from '../deleteArticle'
import { deleteArticleFileUseCase } from '../deleteArticleFile'
import { listArticlesUseCase } from '../listArticles'
import { listCustomerKeywordsUseCase } from '../listCustomerKeywords'
import { getBlogSettingsUseCase, updateBlogSettingsUseCase } from '../manageBlogSettings'
import { messageBlogWriterUseCase } from '../messageBlogWriter'
import { recalculateStatus } from '../recalculateStatus'
import { submitClientFeedbackUseCase } from '../submitClientFeedback'
import { submitStageWorkUseCase } from '../submitStageWork'
import { updateArticleUseCase } from '../updateArticle'
import { updateStageUseCase } from '../updateStage'
import {
  AUTHOR_ID,
  CUSTOMER_ID,
  FakeBlogFileStorage,
  FakeBlogKeywordReader,
  InMemoryBlogArticleRepository,
  InMemoryBlogSettingsRepository,
  OTHER_CUSTOMER_ID,
  buildStages,
  fakeFile,
} from './fakes'

function setup() {
  const articles = new InMemoryBlogArticleRepository()
  const storage = new FakeBlogFileStorage()
  const settings = new InMemoryBlogSettingsRepository()
  settings.seed(CUSTOMER_ID)
  return { articles, storage, settings }
}

const articleDoc = () => [{ kind: 'ARTICLE_DOC' as const, file: fakeFile() }]

describe('createArticle', () => {
  const draft = {
    title: 'บทความใหม่',
    keyFocus: null,
    targetYear: 2026,
    targetMonth: 8,
    startDate: new Date('2026-08-01T00:00:00.000Z'),
    note: null,
    keywords: [],
  }

  it('ลูกค้าที่ต้องตรวจงาน = กาง stage ครบ 5 ขั้นจาก startDate ที่ส่งมา', async () => {
    const { articles, settings } = setup()

    const article = await createArticleUseCase(articles, settings)(CUSTOMER_ID, draft, AUTHOR_ID)

    expect(article.stages).toHaveLength(5)
    expect(article.stages[0].dueDate?.toISOString().slice(0, 10)).toBe('2026-08-06')
    expect(article.stages.every((stage) => stage.submittedAt === null)).toBe(true)
  })

  it('ลูกค้าที่ไม่ต้องตรวจงาน = มีแค่ขั้นส่งไฟล์ final', async () => {
    const { articles, settings } = setup()
    settings.seed(CUSTOMER_ID, { blogRequiresApproval: false })

    const article = await createArticleUseCase(articles, settings)(CUSTOMER_ID, draft, AUTHOR_ID)

    expect(article.stages.map((stage) => stage.stageCode)).toEqual(['SUBMIT_FINAL'])
  })

  it('ไม่พบลูกค้า = NotFoundError', async () => {
    const { articles } = setup()
    const empty = new InMemoryBlogSettingsRepository()

    await expect(
      createArticleUseCase(articles, empty)(CUSTOMER_ID, draft, AUTHOR_ID),
    ).rejects.toThrow(NotFoundError)
  })

  it('ตัด keyword ซ้ำแบบไม่สนตัวพิมพ์ — กัน unique([articleId, keyword]) ชน', async () => {
    const { articles, settings } = setup()
    const create = createArticleUseCase(articles, settings)

    const article = await create(
      CUSTOMER_ID,
      {
        title: 'บทความใหม่',
        keyFocus: null,
        targetYear: 2026,
        targetMonth: 8,
        startDate: null,
        note: null,
        keywords: [
          { keyword: 'SEO', source: 'REPORT', sourceId: null },
          { keyword: 'seo', source: 'MANUAL', sourceId: null },
          { keyword: 'content', source: 'MANUAL', sourceId: null },
        ],
      },
      null,
    )

    expect(article.keywords.map((k) => k.keyword)).toEqual(['SEO', 'content'])
  })
})

describe('dedupeKeywords', () => {
  it('เก็บตัวแรกที่เจอและคง order เดิม', () => {
    expect(
      dedupeKeywords([{ keyword: 'A' }, { keyword: 'b' }, { keyword: 'a' }, { keyword: 'B' }]),
    ).toEqual([{ keyword: 'A' }, { keyword: 'b' }])
  })
})

describe('updateArticle', () => {
  it('เลื่อน startDate = เลื่อน dueDate ทั้ง pipeline แต่ไม่แตะ submittedAt ที่เกิดขึ้นจริงแล้ว', async () => {
    const { articles } = setup()
    const submittedAt = new Date('2026-07-20T00:00:00.000Z')
    const article = articles.seed()
    article.stages[0].submittedAt = submittedAt

    await updateArticleUseCase(articles)(article.id, CUSTOMER_ID, {
      startDate: new Date('2026-09-01T00:00:00.000Z'),
    })

    expect(article.stages.every((stage) => stage.dueDate !== null)).toBe(true)
    expect(article.stages[0].dueDate?.toISOString().slice(0, 10)).toBe('2026-09-06')
    expect(article.stages[0].submittedAt).toBe(submittedAt)
  })

  it('ส่ง keywords มา = แทนที่ชุดเดิมโดย dedupe แล้ว', async () => {
    const { articles } = setup()
    const article = articles.seed({
      keywords: [{ id: 'kw-old', keyword: 'เดิม', source: 'MANUAL', sourceId: null }],
    })

    await updateArticleUseCase(articles)(article.id, CUSTOMER_ID, {
      keywords: [
        { keyword: 'ใหม่', source: 'MANUAL', sourceId: null },
        { keyword: 'ใหม่', source: 'REPORT', sourceId: null },
      ],
    })

    expect(article.keywords.map((k) => k.keyword)).toEqual(['ใหม่'])
  })

  it('บทความของลูกค้าคนอื่น = NotFoundError (กัน IDOR)', async () => {
    const { articles } = setup()
    const article = articles.seed()

    await expect(
      updateArticleUseCase(articles)(article.id, OTHER_CUSTOMER_ID, { title: 'แก้' }),
    ).rejects.toThrow(NotFoundError)
  })
})

describe('deleteArticle', () => {
  it('ลบไฟล์บนดิสก์ทั้ง submission และ legacy ก่อนลบแถว', async () => {
    const { articles, storage } = setup()
    const article = articles.seed()
    await articles.addSubmission(article.id, {
      stageCode: 'SUBMIT_TOPIC',
      message: null,
      linkUrl: null,
      authorId: null,
    })
    await articles.addFile(article.id, {
      kind: 'ARTICLE_DOC',
      url: '/uploads/blog/doc.docx',
      filename: 'doc.docx',
      mimeType: 'application/msword',
      sizeBytes: 10,
      uploadedById: null,
      submissionId: article.submissions[0].id,
    })
    await articles.addFile(article.id, {
      kind: 'COVER_IMAGE',
      url: '/uploads/blog/cover.png',
      filename: 'cover.png',
      mimeType: 'image/png',
      sizeBytes: 10,
      uploadedById: null,
      submissionId: null,
    })

    await deleteArticleUseCase(articles, storage)(article.id, CUSTOMER_ID)

    expect(storage.removedUrls).toHaveLength(2)
    expect(storage.removedUrls).toContain('/uploads/blog/doc.docx')
    expect(storage.removedUrls).toContain('/uploads/blog/cover.png')
    expect(articles.articles).toHaveLength(0)
  })

  it('บทความของลูกค้าคนอื่น = NotFoundError (กัน IDOR)', async () => {
    const { articles, storage } = setup()
    const article = articles.seed()

    await expect(
      deleteArticleUseCase(articles, storage)(article.id, OTHER_CUSTOMER_ID),
    ).rejects.toThrow(NotFoundError)
    expect(articles.articles).toHaveLength(1)
  })
})

describe('deleteArticleFile', () => {
  it('ลบแถวใน DB แล้วค่อยลบไฟล์บนดิสก์', async () => {
    const { articles, storage } = setup()
    const article = articles.seed()
    await articles.addFile(article.id, {
      kind: 'COVER_IMAGE',
      url: '/uploads/blog/cover.png',
      filename: 'cover.png',
      mimeType: 'image/png',
      sizeBytes: 10,
      uploadedById: null,
      submissionId: null,
    })
    const fileId = article.legacyFiles[0].id

    await deleteArticleFileUseCase(articles, storage)(article.id, CUSTOMER_ID, fileId)

    expect(article.legacyFiles).toHaveLength(0)
    expect(storage.removedUrls).toEqual(['/uploads/blog/cover.png'])
  })

  it('ไม่พบไฟล์ = NotFoundError และไม่แตะดิสก์', async () => {
    const { articles, storage } = setup()
    const article = articles.seed()

    await expect(
      deleteArticleFileUseCase(articles, storage)(article.id, CUSTOMER_ID, 'file-ไม่มีจริง'),
    ).rejects.toThrow(NotFoundError)
    expect(storage.removedUrls).toHaveLength(0)
  })

  it('บทความของลูกค้าคนอื่น = NotFoundError (กัน IDOR)', async () => {
    const { articles, storage } = setup()
    const article = articles.seed()

    await expect(
      deleteArticleFileUseCase(articles, storage)(article.id, OTHER_CUSTOMER_ID, 'file-1'),
    ).rejects.toThrow(NotFoundError)
  })
})

describe('listArticles', () => {
  it('filter ครบปี+เดือน = คืน monthlyCount ไว้เทียบโควตา', async () => {
    const { articles } = setup()
    articles.seed({ targetYear: 2026, targetMonth: 8 })
    articles.seed({ targetYear: 2026, targetMonth: 8 })
    articles.seed({ targetYear: 2026, targetMonth: 9 })

    const result = await listArticlesUseCase(articles)(CUSTOMER_ID, { year: 2026, month: 8 })

    expect(result.articles).toHaveLength(2)
    expect(result.monthlyCount).toBe(2)
  })

  it('ไม่ได้ filter เดือน = ไม่นับโควตา', async () => {
    const { articles } = setup()
    articles.seed()

    const result = await listArticlesUseCase(articles)(CUSTOMER_ID, { year: 2026 })

    expect(result.monthlyCount).toBeNull()
  })

  it('ไม่คืนบทความของลูกค้าคนอื่น', async () => {
    const { articles } = setup()
    articles.seed({ customerId: OTHER_CUSTOMER_ID })

    const result = await listArticlesUseCase(articles)(CUSTOMER_ID, {})

    expect(result.articles).toHaveLength(0)
  })
})

describe('listCustomerKeywords', () => {
  it('ติด usedCount โดยจับคู่ข้อความตัวพิมพ์เล็ก ไม่ใช่ FK', async () => {
    const { articles } = setup()
    articles.seed({
      keywords: [{ id: 'kw-1', keyword: 'SEO Agency', source: 'REPORT', sourceId: 'r-1' }],
    })
    const keywords = new FakeBlogKeywordReader([
      { keyword: 'seo agency', source: 'REPORT', sourceId: 'r-1', position: 3, kd: 'ง่าย' },
      { keyword: 'ยังไม่ใช้', source: 'RECOMMEND', sourceId: 'r-2', position: null, kd: null },
    ])

    const result = await listCustomerKeywordsUseCase(keywords, articles)(CUSTOMER_ID)

    expect(result.map((option) => option.usedCount)).toEqual([1, 0])
  })
})

describe('updateStage', () => {
  it('stage ของลูกค้าจะ toggle submitted ไม่ได้ — ต้องผ่าน submitClientFeedback', async () => {
    const { articles } = setup()
    const article = articles.seed()

    await expect(
      updateStageUseCase(articles)(article.id, CUSTOMER_ID, 'CLIENT_FEEDBACK_TOPIC', {
        submitted: false,
      }),
    ).rejects.toThrow(BadRequestError)
  })

  it('ติ๊กว่าส่งแล้วเฉย ๆ ไม่ได้ — ต้องส่งพร้อมเนื้อหาผ่าน submitStageWork', async () => {
    const { articles } = setup()
    const article = articles.seed()

    await expect(
      updateStageUseCase(articles)(article.id, CUSTOMER_ID, 'SUBMIT_TOPIC', { submitted: true }),
    ).rejects.toThrow(BadRequestError)
  })

  it('ยกเลิกการส่ง = เคลียร์ submittedAt แล้ว derive status ใหม่', async () => {
    const { articles } = setup()
    const article = articles.seed({ status: 'WAITING_CLIENT' })
    article.stages[0].submittedAt = new Date()

    const result = await updateStageUseCase(articles)(article.id, CUSTOMER_ID, 'SUBMIT_TOPIC', {
      submitted: false,
    })

    expect(article.stages[0].submittedAt).toBeNull()
    expect(result.status).toBe('DRAFT')
  })

  it('แก้ dueDate/note ได้โดยไม่แตะ submittedAt', async () => {
    const { articles } = setup()
    const article = articles.seed()
    const dueDate = new Date('2026-09-15T00:00:00.000Z')

    await updateStageUseCase(articles)(article.id, CUSTOMER_ID, 'SUBMIT_TOPIC', {
      dueDate,
      note: 'เลื่อนตามที่คุยกับลูกค้า',
    })

    expect(article.stages[0].dueDate).toBe(dueDate)
    expect(article.stages[0].note).toBe('เลื่อนตามที่คุยกับลูกค้า')
    expect(article.stages[0].submittedAt).toBeNull()
  })

  it('บทความของลูกค้าคนอื่น = NotFoundError (กัน IDOR)', async () => {
    const { articles } = setup()
    const article = articles.seed()

    await expect(
      updateStageUseCase(articles)(article.id, OTHER_CUSTOMER_ID, 'SUBMIT_TOPIC', { note: 'x' }),
    ).rejects.toThrow(NotFoundError)
  })
})

describe('submitStageWork', () => {
  const emptyInput = { message: null, linkUrl: null }

  it('stage ของลูกค้าให้ทีมเขียนส่งแทนไม่ได้', async () => {
    const { articles, storage } = setup()
    const article = articles.seed()

    await expect(
      submitStageWorkUseCase(articles, storage)(
        article.id,
        CUSTOMER_ID,
        'CLIENT_FEEDBACK_TOPIC',
        { message: 'ส่งแทนลูกค้า', linkUrl: null },
        [],
        AUTHOR_ID,
      ),
    ).rejects.toThrow(BadRequestError)
  })

  it('stage ที่ไม่รับไฟล์ชนิดนั้น = แนบไม่ได้', async () => {
    const { articles, storage } = setup()
    const article = articles.seed()

    await expect(
      submitStageWorkUseCase(articles, storage)(
        article.id,
        CUSTOMER_ID,
        'SUBMIT_TOPIC',
        emptyInput,
        [{ kind: 'COVER_IMAGE', file: fakeFile('cover.png') }],
        AUTHOR_ID,
      ),
    ).rejects.toThrow(BadRequestError)
    expect(storage.written).toHaveLength(0)
  })

  it('ขั้นไฟล์ final = ต้องแนบทั้งไฟล์บทความและภาพปก', async () => {
    const { articles, storage } = setup()
    const article = articles.seed()
    const submit = submitStageWorkUseCase(articles, storage)

    await expect(
      submit(article.id, CUSTOMER_ID, 'SUBMIT_FINAL', emptyInput, articleDoc(), AUTHOR_ID),
    ).rejects.toThrow(BadRequestError)
    expect(storage.written).toHaveLength(0)

    await submit(
      article.id,
      CUSTOMER_ID,
      'SUBMIT_FINAL',
      emptyInput,
      [
        { kind: 'ARTICLE_DOC', file: fakeFile('final.docx') },
        { kind: 'COVER_IMAGE', file: fakeFile('cover.png') },
      ],
      AUTHOR_ID,
    )

    expect(article.submissions[0].files.map((file) => file.kind)).toEqual([
      'ARTICLE_DOC',
      'COVER_IMAGE',
    ])
  })

  it('fast track: ส่งไฟล์ final ขั้นเดียวแล้วบทความเสร็จเลย', async () => {
    const { articles, storage } = setup()
    const article = articles.seed({ stages: buildStages(false) })

    const result = await submitStageWorkUseCase(articles, storage)(
      article.id,
      CUSTOMER_ID,
      'SUBMIT_FINAL',
      emptyInput,
      [
        { kind: 'ARTICLE_DOC', file: fakeFile('final.docx') },
        { kind: 'COVER_IMAGE', file: fakeFile('cover.png') },
      ],
      AUTHOR_ID,
    )

    expect(result.status).toBe('PUBLISHED')
  })

  it('stage ที่ไม่อยู่ใน flow ของบทความ = ส่งไม่ได้', async () => {
    const { articles, storage } = setup()
    const article = articles.seed({ stages: buildStages(false) })

    await expect(
      submitStageWorkUseCase(articles, storage)(
        article.id,
        CUSTOMER_ID,
        'SUBMIT_TOPIC',
        { message: 'เสนอหัวข้อ', linkUrl: null },
        [],
        AUTHOR_ID,
      ),
    ).rejects.toThrow(BadRequestError)
  })

  it('ต้องมีข้อความ ลิงก์ หรือไฟล์อย่างน้อย 1 อย่าง', async () => {
    const { articles, storage } = setup()
    const article = articles.seed()

    await expect(
      submitStageWorkUseCase(articles, storage)(
        article.id,
        CUSTOMER_ID,
        'SUBMIT_TOPIC',
        emptyInput,
        [],
        AUTHOR_ID,
      ),
    ).rejects.toThrow(BadRequestError)
  })

  it('ส่งสำเร็จ = บันทึกไฟล์ ปิด stage แล้วสถานะเป็นรอลูกค้า', async () => {
    const { articles, storage } = setup()
    const article = articles.seed()

    const result = await submitStageWorkUseCase(articles, storage)(
      article.id,
      CUSTOMER_ID,
      'SUBMIT_TOPIC',
      { message: 'เสนอ 3 หัวข้อ', linkUrl: null },
      articleDoc(),
      AUTHOR_ID,
    )

    expect(result).toMatchObject({ status: 'WAITING_CLIENT', stageCode: 'SUBMIT_TOPIC', round: 1 })
    expect(article.submissions[0].files).toHaveLength(1)
    expect(article.stages[0].submittedAt).not.toBeNull()
  })

  it('ส่งซ้ำใน stage เดิม = round เดินหน้า', async () => {
    const { articles, storage } = setup()
    const article = articles.seed()
    const submit = submitStageWorkUseCase(articles, storage)
    const input = { message: 'รอบแรก', linkUrl: null }

    await submit(article.id, CUSTOMER_ID, 'SUBMIT_TOPIC', input, [], AUTHOR_ID)
    const second = await submit(
      article.id,
      CUSTOMER_ID,
      'SUBMIT_TOPIC',
      { message: 'แก้ตามที่ขอ', linkUrl: null },
      [],
      AUTHOR_ID,
    )

    expect(second.round).toBe(2)
  })

  it('บันทึกไฟล์ล้มเหลว = rollback ทั้งไฟล์บนดิสก์และ submission', async () => {
    const { articles, storage } = setup()
    const article = articles.seed()
    articles.failNextAddFile = true

    await expect(
      submitStageWorkUseCase(articles, storage)(
        article.id,
        CUSTOMER_ID,
        'SUBMIT_TOPIC',
        { message: 'เสนอหัวข้อ', linkUrl: null },
        articleDoc(),
        AUTHOR_ID,
      ),
    ).rejects.toThrow('fake: addFile failed')

    expect(storage.removedPaths).toEqual([storage.written[0].absolutePath])
    expect(article.submissions).toHaveLength(0)
    expect(article.stages[0].submittedAt).toBeNull()
  })

  it('บทความของลูกค้าคนอื่น = NotFoundError (กัน IDOR)', async () => {
    const { articles, storage } = setup()
    const article = articles.seed()

    await expect(
      submitStageWorkUseCase(articles, storage)(
        article.id,
        OTHER_CUSTOMER_ID,
        'SUBMIT_TOPIC',
        { message: 'x', linkUrl: null },
        [],
        AUTHOR_ID,
      ),
    ).rejects.toThrow(NotFoundError)
  })
})

describe('submitClientFeedback', () => {
  it('stage ที่ไม่ใช่ของลูกค้า = ให้ความเห็นไม่ได้', async () => {
    const { articles } = setup()
    const article = articles.seed()

    await expect(
      submitClientFeedbackUseCase(articles)(
        article.id,
        CUSTOMER_ID,
        { stageCode: 'SUBMIT_TOPIC', decision: 'APPROVED', comment: null },
        AUTHOR_ID,
      ),
    ).rejects.toThrow(BadRequestError)
  })

  it('ทีมยังไม่ส่งงานมา = ตอบไม่ได้', async () => {
    const { articles } = setup()
    const article = articles.seed()

    await expect(
      submitClientFeedbackUseCase(articles)(
        article.id,
        CUSTOMER_ID,
        { stageCode: 'CLIENT_FEEDBACK_TOPIC', decision: 'APPROVED', comment: null },
        AUTHOR_ID,
      ),
    ).rejects.toThrow(BadRequestError)
  })

  it('อนุมัติ = ปิด stage ของลูกค้าแล้วคิวกลับไปที่ทีมเขียน', async () => {
    const { articles } = setup()
    const article = articles.seed()
    article.stages[0].submittedAt = new Date()

    const result = await submitClientFeedbackUseCase(articles)(
      article.id,
      CUSTOMER_ID,
      { stageCode: 'CLIENT_FEEDBACK_TOPIC', decision: 'APPROVED', comment: 'เอาหัวข้อที่ 2' },
      AUTHOR_ID,
    )

    expect(article.stages[1].submittedAt).not.toBeNull()
    expect(result.status).toBe('IN_PROGRESS')
    expect(result.articleTitle).toBe(article.title)
  })

  it('ขอแก้ = ย้อน pipeline กลับไปให้ทีมเขียนส่ง stage ก่อนหน้าใหม่', async () => {
    const { articles } = setup()
    const article = articles.seed()
    article.stages[0].submittedAt = new Date()

    const result = await submitClientFeedbackUseCase(articles)(
      article.id,
      CUSTOMER_ID,
      { stageCode: 'CLIENT_FEEDBACK_TOPIC', decision: 'CHANGES_REQUESTED', comment: 'ขอใหม่' },
      AUTHOR_ID,
    )

    expect(article.stages[0].submittedAt).toBeNull()
    expect(article.stages[1].submittedAt).toBeNull()
    expect(result.status).toBe('DRAFT')
    expect(article.feedbacks[0].decision).toBe('CHANGES_REQUESTED')
  })

  it('บทความของลูกค้าคนอื่น = NotFoundError (กัน IDOR)', async () => {
    const { articles } = setup()
    const article = articles.seed()

    await expect(
      submitClientFeedbackUseCase(articles)(
        article.id,
        OTHER_CUSTOMER_ID,
        { stageCode: 'CLIENT_FEEDBACK_TOPIC', decision: 'APPROVED', comment: null },
        AUTHOR_ID,
      ),
    ).rejects.toThrow(NotFoundError)
  })
})

describe('recalculateStatus', () => {
  it('เขียน status กลับก็ต่อเมื่อค่าที่ derive ได้ต่างจากเดิม', async () => {
    const { articles } = setup()
    const article = articles.seed({ status: 'DRAFT' })
    const setStatus = vi.spyOn(articles, 'setStatus')

    expect(await recalculateStatus(articles, article.id, CUSTOMER_ID)).toBe('DRAFT')
    expect(setStatus).not.toHaveBeenCalled()

    article.stages[0].submittedAt = new Date()
    expect(await recalculateStatus(articles, article.id, CUSTOMER_ID)).toBe('WAITING_CLIENT')
    expect(setStatus).toHaveBeenCalledWith(article.id, 'WAITING_CLIENT')
  })

  it('บทความของลูกค้าคนอื่น = NotFoundError (กัน IDOR)', async () => {
    const { articles } = setup()
    const article = articles.seed()

    await expect(recalculateStatus(articles, article.id, OTHER_CUSTOMER_ID)).rejects.toThrow(
      NotFoundError,
    )
  })
})

describe('manageBlogSettings', () => {
  it('ไม่พบลูกค้า = NotFoundError', async () => {
    const settings = new InMemoryBlogSettingsRepository()

    await expect(getBlogSettingsUseCase(settings)(CUSTOMER_ID)).rejects.toThrow(NotFoundError)
  })

  it('assign คนที่ไม่ใช่ BLOG_WRITER ไม่ได้', async () => {
    const { articles, settings } = setup()

    await expect(
      updateBlogSettingsUseCase(settings, articles)(CUSTOMER_ID, {
        blogWriterId: 'user-ที่ไม่ใช่นักเขียน',
      }),
    ).rejects.toThrow(BadRequestError)
  })

  it('assign BLOG_WRITER จริงได้', async () => {
    const { articles, settings } = setup()
    settings.seedWriter('writer-1')

    const result = await updateBlogSettingsUseCase(settings, articles)(CUSTOMER_ID, {
      blogWriterId: 'writer-1',
      articlesPerMonth: 8,
    })

    expect(result).toMatchObject({ blogWriterId: 'writer-1', articlesPerMonth: 8 })
  })

  it('ไม่ได้ส่ง blogWriterId มา = ข้ามการตรวจ role', async () => {
    const { articles, settings } = setup()
    const isBlogWriter = vi.spyOn(settings, 'isBlogWriter')

    const result = await updateBlogSettingsUseCase(settings, articles)(CUSTOMER_ID, {
      articlesPerMonth: 2,
    })

    expect(isBlogWriter).not.toHaveBeenCalled()
    expect(result.articlesPerMonth).toBe(2)
  })

  it('ปิดโหมดตรวจงาน = บทความที่ยังไม่จบเหลือแค่ขั้นส่งไฟล์ final', async () => {
    const { articles, settings } = setup()
    const article = articles.seed()
    article.stages[0].submittedAt = new Date()

    await updateBlogSettingsUseCase(settings, articles)(CUSTOMER_ID, {
      blogRequiresApproval: false,
    })

    // ขั้นที่ส่งไปแล้วคงไว้เป็นประวัติ ที่เหลือถูกตัดออกจากแผน
    expect(article.stages.map((stage) => stage.stageCode)).toEqual(['SUBMIT_TOPIC', 'SUBMIT_FINAL'])
    expect(article.status).toBe('IN_PROGRESS')
  })

  it('เปิดโหมดตรวจงานกลับ = เติมขั้นที่ขาดให้บทความที่ยังไม่จบ', async () => {
    const { articles, settings } = setup()
    settings.seed(CUSTOMER_ID, { blogRequiresApproval: false })
    const article = articles.seed({ stages: buildStages(false) })

    await updateBlogSettingsUseCase(settings, articles)(CUSTOMER_ID, { blogRequiresApproval: true })

    expect([...article.stages].map((stage) => stage.stageCode).sort()).toEqual(
      [
        'SUBMIT_TOPIC',
        'CLIENT_FEEDBACK_TOPIC',
        'SUBMIT_ARTICLE',
        'CLIENT_FEEDBACK_ARTICLE',
        'SUBMIT_FINAL',
      ].sort(),
    )
  })

  it('บทความที่เสร็จแล้วไม่ถูกแตะ', async () => {
    const { articles, settings } = setup()
    const article = articles.seed({ status: 'PUBLISHED' })

    await updateBlogSettingsUseCase(settings, articles)(CUSTOMER_ID, {
      blogRequiresApproval: false,
    })

    expect(article.stages).toHaveLength(5)
  })
})

describe('messageBlogWriter', () => {
  it('ไม่พบลูกค้า = NotFoundError', async () => {
    const settings = new InMemoryBlogSettingsRepository()

    await expect(messageBlogWriterUseCase(settings)(CUSTOMER_ID)).rejects.toThrow(NotFoundError)
  })

  it('ยังไม่มีทีมเขียนที่ดูแล = ทักไม่ได้', async () => {
    const settings = new InMemoryBlogSettingsRepository()
    settings.seed(CUSTOMER_ID, { blogWriterId: null })

    await expect(messageBlogWriterUseCase(settings)(CUSTOMER_ID)).rejects.toThrow(BadRequestError)
  })

  it('มีทีมเขียน = คืนปลายทางของ notification', async () => {
    const settings = new InMemoryBlogSettingsRepository()
    settings.seed(CUSTOMER_ID, { blogWriterId: 'writer-1', blogWriterName: 'นักเขียน 1' })

    await expect(messageBlogWriterUseCase(settings)(CUSTOMER_ID)).resolves.toEqual({
      blogWriterId: 'writer-1',
      blogWriterName: 'นักเขียน 1',
    })
  })
})
