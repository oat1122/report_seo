// Fake ที่ implement port ครบตามสัญญาใน application/ports — ใช้ร่วมกันทั้ง unit test และ e2e flow
// จำลอง behavior ที่ use case พึ่งพาจริง: round ต่อ stage, version ต่อ kind,
// feedback เรียงใหม่→เก่า (recalculateStatus อ่าน feedbacks[0] เป็นรายการล่าสุด)

import { buildStageSchedule, getFlowStages } from '../../../domain/policies/stage-schedule'
import type { ScheduledStage } from '../../../domain/policies/stage-schedule'
import type {
  BlogArticle,
  BlogArticleStatus,
  BlogFileKind,
  BlogKeywordSource,
  BlogStageCode,
  CustomerKeywordOption,
} from '../../../domain/BlogArticle'
import type {
  BlogArticleRepository,
  CreateArticleData,
  NewArticleFile,
  NewFeedback,
  NewSubmission,
  StagePatch,
  UpdateArticleData,
} from '../../ports/BlogArticleRepository'
import type { BlogFileStorage, SavedBlogFile } from '../../ports/BlogFileStorage'
import type { BlogKeywordReader } from '../../ports/BlogKeywordReader'
import type {
  BlogSettings,
  BlogSettingsPatch,
  BlogSettingsRepository,
} from '../../ports/BlogSettingsRepository'

export const CUSTOMER_ID = 'customer-1'
export const OTHER_CUSTOMER_ID = 'customer-2'
export const AUTHOR_ID = 'user-1'

export class InMemoryBlogArticleRepository implements BlogArticleRepository {
  readonly articles: BlogArticle[] = []
  /** ให้ addFile โยน error รอบถัดไป — ใช้ทดสอบ rollback ของ submitStageWork */
  failNextAddFile = false

  private counter = 0

  private nextId(prefix: string): string {
    this.counter += 1
    return `${prefix}-${this.counter}`
  }

  /** use case คืน reference ตรง ๆ ไม่ clone — test อ่านสถานะหลัง patch ได้จากตัวเดียวกัน */
  private require(articleId: string): BlogArticle {
    const found = this.articles.find((article) => article.id === articleId)
    if (!found) throw new Error(`fake: unknown article ${articleId}`)
    return found
  }

  seed(overrides: Partial<BlogArticle> = {}): BlogArticle {
    const article = buildArticle({ id: this.nextId('article'), ...overrides })
    this.articles.push(article)
    return article
  }

  async listByCustomer(
    customerId: string,
    filter: { year?: number; month?: number },
  ): Promise<BlogArticle[]> {
    return this.articles.filter(
      (article) =>
        article.customerId === customerId &&
        (filter.year === undefined || article.targetYear === filter.year) &&
        (filter.month === undefined || article.targetMonth === filter.month),
    )
  }

  async findByIdForCustomer(articleId: string, customerId: string): Promise<BlogArticle | null> {
    const found = this.articles.find(
      (article) => article.id === articleId && article.customerId === customerId,
    )
    return found ?? null
  }

  async countByMonth(customerId: string, year: number, month: number): Promise<number> {
    return this.articles.filter(
      (article) =>
        article.customerId === customerId &&
        article.targetYear === year &&
        article.targetMonth === month,
    ).length
  }

  async countArticlesPerKeyword(customerId: string): Promise<Map<string, number>> {
    const usage = new Map<string, number>()
    for (const article of this.articles) {
      if (article.customerId !== customerId) continue
      for (const { keyword } of article.keywords) {
        const key = keyword.toLowerCase()
        usage.set(key, (usage.get(key) ?? 0) + 1)
      }
    }
    return usage
  }

  async create(data: CreateArticleData): Promise<BlogArticle> {
    const article = buildArticle({
      id: this.nextId('article'),
      customerId: data.customerId,
      title: data.title,
      keyFocus: data.keyFocus,
      targetYear: data.targetYear,
      targetMonth: data.targetMonth,
      startDate: data.startDate,
      note: data.note,
      keywords: data.keywords.map((keyword) => ({ id: this.nextId('kw'), ...keyword })),
      stages: data.stages.map((stage) => ({
        id: this.nextId('stage'),
        stageCode: stage.stageCode,
        seq: stage.seq,
        dueDate: stage.dueDate,
        submittedAt: null,
        note: null,
      })),
    })
    this.articles.push(article)
    return article
  }

  async update(articleId: string, data: UpdateArticleData): Promise<void> {
    Object.assign(this.require(articleId), data)
  }

  async delete(articleId: string): Promise<void> {
    const index = this.articles.findIndex((article) => article.id === articleId)
    if (index >= 0) this.articles.splice(index, 1)
  }

  async replaceKeywords(
    articleId: string,
    keywords: { keyword: string; source: BlogKeywordSource; sourceId: string | null }[],
  ): Promise<void> {
    this.require(articleId).keywords = keywords.map((keyword) => ({
      id: this.nextId('kw'),
      ...keyword,
    }))
  }

  async patchStage(articleId: string, stageCode: BlogStageCode, patch: StagePatch): Promise<void> {
    const stage = this.require(articleId).stages.find((s) => s.stageCode === stageCode)
    if (!stage) throw new Error(`fake: unknown stage ${stageCode}`)
    Object.assign(stage, patch)
  }

  async addStages(articleId: string, stages: ScheduledStage[]): Promise<void> {
    const article = this.require(articleId)
    article.stages = [
      ...article.stages,
      ...stages.map((stage) => ({
        id: this.nextId('stage'),
        stageCode: stage.stageCode,
        seq: stage.seq,
        dueDate: stage.dueDate,
        submittedAt: null,
        note: null,
      })),
    ].sort((a, b) => a.seq - b.seq)
  }

  async deleteStages(articleId: string, stageCodes: BlogStageCode[]): Promise<void> {
    const article = this.require(articleId)
    article.stages = article.stages.filter((stage) => !stageCodes.includes(stage.stageCode))
  }

  async setStatus(articleId: string, status: BlogArticleStatus): Promise<void> {
    this.require(articleId).status = status
  }

  async addSubmission(
    articleId: string,
    submission: NewSubmission,
  ): Promise<{ id: string; round: number }> {
    const article = this.require(articleId)
    const previous = article.submissions.filter((s) => s.stageCode === submission.stageCode)
    const round = previous.length + 1
    const id = this.nextId('submission')

    article.submissions.push({
      id,
      stageCode: submission.stageCode,
      round,
      message: submission.message,
      linkUrl: submission.linkUrl,
      createdAt: new Date(),
      authorName: submission.authorId,
      files: [],
    })
    return { id, round }
  }

  async deleteSubmission(submissionId: string): Promise<void> {
    for (const article of this.articles) {
      const index = article.submissions.findIndex((s) => s.id === submissionId)
      if (index >= 0) article.submissions.splice(index, 1)
    }
  }

  async addFile(articleId: string, file: NewArticleFile): Promise<number> {
    if (this.failNextAddFile) {
      this.failNextAddFile = false
      throw new Error('fake: addFile failed')
    }

    const article = this.require(articleId)
    const sameKind = [
      ...article.legacyFiles,
      ...article.submissions.flatMap((s) => s.files),
    ].filter((existing) => existing.kind === file.kind)
    const version = sameKind.length + 1

    const stored = {
      id: this.nextId('file'),
      kind: file.kind,
      url: file.url,
      filename: file.filename,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      version,
      createdAt: new Date(),
      uploadedByName: file.uploadedById,
    }

    const submission = article.submissions.find((s) => s.id === file.submissionId)
    if (submission) submission.files.push(stored)
    else article.legacyFiles.push(stored)

    return version
  }

  async findFile(
    fileId: string,
    articleId: string,
  ): Promise<{ id: string; url: string; kind: BlogFileKind } | null> {
    const article = this.require(articleId)
    const found = [...article.legacyFiles, ...article.submissions.flatMap((s) => s.files)].find(
      (file) => file.id === fileId,
    )
    return found ? { id: found.id, url: found.url, kind: found.kind } : null
  }

  async deleteFile(fileId: string): Promise<void> {
    for (const article of this.articles) {
      article.legacyFiles = article.legacyFiles.filter((file) => file.id !== fileId)
      for (const submission of article.submissions) {
        submission.files = submission.files.filter((file) => file.id !== fileId)
      }
    }
  }

  async addFeedback(articleId: string, feedback: NewFeedback): Promise<void> {
    // Prisma repo อ่าน feedbacks แบบ createdAt desc — ตัวล่าสุดต้องอยู่หัว list
    this.require(articleId).feedbacks.unshift({
      id: this.nextId('feedback'),
      stageCode: feedback.stageCode,
      decision: feedback.decision,
      comment: feedback.comment,
      createdAt: new Date(),
      authorName: feedback.authorId,
    })
  }
}

export class FakeBlogFileStorage implements BlogFileStorage {
  readonly written: SavedBlogFile[] = []
  readonly removedUrls: string[] = []
  readonly removedPaths: string[] = []

  async validateAndWrite(file: File, kind: BlogFileKind): Promise<SavedBlogFile> {
    const saved: SavedBlogFile = {
      url: `/uploads/blog/${kind}_${file.name}`,
      absolutePath: `/abs/uploads/blog/${kind}_${file.name}`,
      filename: `${kind}_${file.name}`,
      mimeType: file.type,
      sizeBytes: file.size,
    }
    this.written.push(saved)
    return saved
  }

  async removeByPublicUrl(url: string): Promise<void> {
    this.removedUrls.push(url)
  }

  async removeByAbsolutePath(absolutePath: string): Promise<void> {
    this.removedPaths.push(absolutePath)
  }
}

export class FakeBlogKeywordReader implements BlogKeywordReader {
  constructor(private readonly options: Omit<CustomerKeywordOption, 'usedCount'>[] = []) {}

  async listByCustomer(customerId: string): Promise<Omit<CustomerKeywordOption, 'usedCount'>[]> {
    return customerId === CUSTOMER_ID ? this.options : []
  }
}

export class InMemoryBlogSettingsRepository implements BlogSettingsRepository {
  private readonly rows = new Map<string, BlogSettings>()
  private readonly writers = new Set<string>()

  seed(customerId: string, settings: Partial<BlogSettings> = {}): void {
    this.rows.set(customerId, {
      articlesPerMonth: 4,
      blogWriterId: null,
      blogWriterName: null,
      blogRequiresApproval: true,
      ...settings,
    })
  }

  seedWriter(userId: string): void {
    this.writers.add(userId)
  }

  async get(customerId: string): Promise<BlogSettings | null> {
    return this.rows.get(customerId) ?? null
  }

  async update(customerId: string, patch: BlogSettingsPatch): Promise<BlogSettings> {
    const current = this.rows.get(customerId)
    if (!current) throw new Error(`fake: unknown customer ${customerId}`)
    const next = { ...current, ...patch }
    this.rows.set(customerId, next)
    return next
  }

  async isBlogWriter(userId: string): Promise<boolean> {
    return this.writers.has(userId)
  }
}

/** stage row เปล่า ๆ ของ flow ที่ต้องการ — ใช้ seed บทความ fast track ในเทสต์ */
export function buildStages(requiresApproval: boolean): BlogArticle['stages'] {
  return buildStageSchedule(null, getFlowStages(requiresApproval)).map((stage, index) => ({
    id: `stage-${index + 1}`,
    stageCode: stage.stageCode,
    seq: stage.seq,
    dueDate: stage.dueDate,
    submittedAt: null,
    note: null,
  }))
}

/** บทความเปล่าที่มี stage ครบทั้ง 5 ขั้น — override เฉพาะ field ที่เทสต์สนใจ */
export function buildArticle(overrides: Partial<BlogArticle> = {}): BlogArticle {
  const now = new Date('2026-08-01T00:00:00.000Z')
  return {
    id: 'article-1',
    customerId: CUSTOMER_ID,
    title: 'บทความทดสอบ',
    keyFocus: null,
    targetYear: 2026,
    targetMonth: 8,
    status: 'DRAFT',
    orderIndex: 0,
    startDate: null,
    publishedUrl: null,
    note: null,
    createdAt: now,
    updatedAt: now,
    createdByName: null,
    keywords: [],
    stages: buildStages(true),
    legacyFiles: [],
    submissions: [],
    feedbacks: [],
    ...overrides,
  }
}

/** ไฟล์ปลอมที่ผ่าน type ของ Web File API — Node 20+ มี File เป็น global */
export function fakeFile(name = 'draft.docx'): File {
  return new File(['content'], name, { type: 'application/msword' })
}
