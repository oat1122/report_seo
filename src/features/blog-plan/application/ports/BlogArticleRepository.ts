import type {
  BlogArticle,
  BlogArticleStatus,
  BlogFeedbackDecision,
  BlogFileKind,
  BlogKeywordSource,
  BlogStageCode,
} from '../../domain/BlogArticle'
import type { ScheduledStage } from '../../domain/policies/stage-schedule'

export interface CreateArticleData {
  customerId: string
  title: string
  keyFocus: string | null
  targetYear: number
  targetMonth: number
  startDate: Date | null
  note: string | null
  createdById: string | null
  stages: ScheduledStage[]
  keywords: { keyword: string; source: BlogKeywordSource; sourceId: string | null }[]
}

export interface UpdateArticleData {
  title?: string
  keyFocus?: string | null
  targetYear?: number
  targetMonth?: number
  startDate?: Date | null
  publishedUrl?: string | null
  note?: string | null
  orderIndex?: number
}

export interface StagePatch {
  dueDate?: Date | null
  submittedAt?: Date | null
  note?: string | null
}

export interface NewArticleFile {
  kind: BlogFileKind
  url: string
  filename: string
  mimeType: string
  sizeBytes: number
  uploadedById: string | null
}

export interface NewFeedback {
  stageCode: BlogStageCode
  decision: BlogFeedbackDecision
  comment: string | null
  authorId: string | null
}

export interface BlogArticleRepository {
  listByCustomer(
    customerId: string,
    filter: { year?: number; month?: number },
  ): Promise<BlogArticle[]>

  /** คืน null เมื่อไม่พบ หรือบทความไม่ได้เป็นของ customer นี้ (กัน IDOR) */
  findByIdForCustomer(articleId: string, customerId: string): Promise<BlogArticle | null>

  countByMonth(customerId: string, year: number, month: number): Promise<number>

  /** จำนวนบทความที่ใช้แต่ละ keyword ของลูกค้ารายนี้ (key = keyword ตัวพิมพ์เล็ก) */
  countArticlesPerKeyword(customerId: string): Promise<Map<string, number>>

  create(data: CreateArticleData): Promise<BlogArticle>
  update(articleId: string, data: UpdateArticleData): Promise<void>
  delete(articleId: string): Promise<void>

  replaceKeywords(
    articleId: string,
    keywords: { keyword: string; source: BlogKeywordSource; sourceId: string | null }[],
  ): Promise<void>

  patchStage(articleId: string, stageCode: BlogStageCode, patch: StagePatch): Promise<void>
  setStatus(articleId: string, status: BlogArticleStatus): Promise<void>

  /** คืน version ที่ถูกบันทึก — นับต่อจากไฟล์เดิมของ kind เดียวกัน (ไม่ทับของเก่า) */
  addFile(articleId: string, file: NewArticleFile): Promise<number>
  findFile(
    fileId: string,
    articleId: string,
  ): Promise<{ id: string; url: string; kind: BlogFileKind } | null>
  deleteFile(fileId: string): Promise<void>

  addFeedback(articleId: string, feedback: NewFeedback): Promise<void>
}
