// Pure domain types — literal union ต้องตรงกับ enum ใน prisma/schema/_base.prisma
// (domain ห้าม import Prisma ตาม rule 09)

export type BlogStageCode =
  | 'SUBMIT_TOPIC'
  | 'CLIENT_FEEDBACK_TOPIC'
  | 'SUBMIT_ARTICLE'
  | 'CLIENT_FEEDBACK_ARTICLE'
  | 'SUBMIT_FINAL'

export type BlogArticleStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'WAITING_CLIENT'
  | 'CHANGES_REQUESTED'
  | 'PUBLISHED'

export type BlogFileKind = 'COVER_IMAGE' | 'ARTICLE_DOC'

export type BlogFeedbackDecision = 'APPROVED' | 'CHANGES_REQUESTED'

export type BlogKeywordSource = 'REPORT' | 'RECOMMEND' | 'MANUAL'

export interface BlogArticleKeyword {
  id: string
  keyword: string
  source: BlogKeywordSource
  sourceId: string | null
}

export interface BlogArticleStage {
  id: string
  stageCode: BlogStageCode
  seq: number
  dueDate: Date | null
  submittedAt: Date | null
  note: string | null
}

export interface BlogArticleFile {
  id: string
  kind: BlogFileKind
  url: string
  filename: string
  mimeType: string
  sizeBytes: number
  version: number
  createdAt: Date
  uploadedByName: string | null
}

/** งานที่ทีมเขียนส่งให้ลูกค้า 1 รอบ — round เริ่มที่ 1 และ +1 ทุกครั้งที่ส่งซ้ำใน stage เดิม */
export interface BlogArticleSubmission {
  id: string
  stageCode: BlogStageCode
  round: number
  message: string | null
  linkUrl: string | null
  createdAt: Date
  authorName: string | null
  files: BlogArticleFile[]
}

export interface BlogArticleFeedback {
  id: string
  stageCode: BlogStageCode
  decision: BlogFeedbackDecision
  comment: string | null
  createdAt: Date
  authorName: string | null
}

export interface BlogArticle {
  id: string
  customerId: string
  title: string
  keyFocus: string | null
  targetYear: number
  targetMonth: number
  status: BlogArticleStatus
  orderIndex: number
  startDate: Date | null
  publishedUrl: string | null
  note: string | null
  createdAt: Date
  updatedAt: Date
  createdByName: string | null
  keywords: BlogArticleKeyword[]
  stages: BlogArticleStage[]
  /** ไฟล์ที่ยังไม่ผูก submission (อัปก่อนมีระบบส่งเป็นรอบ) */
  legacyFiles: BlogArticleFile[]
  submissions: BlogArticleSubmission[]
  feedbacks: BlogArticleFeedback[]
}

/** keyword ของลูกค้า 1 ตัว พร้อมจำนวนบทความที่ใช้ไปแล้ว */
export interface CustomerKeywordOption {
  keyword: string
  source: Exclude<BlogKeywordSource, 'MANUAL'>
  sourceId: string
  position: number | null
  kd: string | null
  usedCount: number
}
