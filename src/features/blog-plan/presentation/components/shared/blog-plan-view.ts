// helper ระดับ view ที่ใช้ร่วมกันหลายการ์ดในหน้าแผนบทความ — pure ทั้งหมด ไม่แตะ React/network

import { BLOG_STAGES, LEGACY_FILE_STAGE } from '../../../domain/policies/stage-schedule'
import { getNextPendingStage } from '../../../domain/policies/article-status'
import type {
  BlogArticle,
  BlogArticleFile,
  BlogArticleStatus,
  BlogStageCode,
} from '../../../domain/BlogArticle'
import type { BlogStageDefinition } from '../../../domain/policies/stage-schedule'

const MONTH_LABELS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
]

/** ปี พ.ศ. — หน้านี้แสดงวันที่ด้วย locale th-TH อยู่แล้ว หัวเดือนจึงต้องเป็นพุทธศักราชด้วย */
function toBuddhistYear(year: number): number {
  return year + 543
}

export function formatMonthLabel(year: number, month: number): string {
  return `${MONTH_LABELS[month - 1]} ${toBuddhistYear(year)}`
}

/** จำนวนวันจากวันนี้ถึง target — ติดลบ = เลยกำหนดแล้ว */
export function daysUntil(date: Date | string): number {
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

export interface CurrentStage {
  definition: BlogStageDefinition
  /** ลำดับเริ่มที่ 1 — ใช้แสดง "ขั้นที่ N จาก 7" */
  step: number
  dueDate: Date | null
}

/** stage ที่ยังไม่ส่ง = ขั้นที่กำลังรออยู่ · null = จบครบทุกขั้นแล้ว */
export function getCurrentStage(article: BlogArticle): CurrentStage | null {
  const code = getNextPendingStage(
    article.stages.filter((stage) => stage.submittedAt).map((stage) => stage.stageCode),
  )
  if (!code) return null

  const definition = BLOG_STAGES.find((stage) => stage.code === code)
  if (!definition) return null

  const dueDate = article.stages.find((stage) => stage.stageCode === code)?.dueDate ?? null
  return { definition, step: definition.seq, dueDate: dueDate ? new Date(dueDate) : null }
}

export type ArticleGroup = 'mine' | 'waiting' | 'done'

const MANAGE_STATUS: BlogArticleStatus[] = ['DRAFT', 'IN_PROGRESS', 'CHANGES_REQUESTED']
const RESPOND_STATUS: BlogArticleStatus[] = ['WAITING_CLIENT']

/** จัดบทความเข้ากลุ่มตามว่า "ถึงคิวเรา" หรือยัง — เกณฑ์ต่างกันตามสิทธิ์ของผู้ใช้ */
export function groupArticle(
  status: BlogArticleStatus,
  canManage: boolean,
  canRespond: boolean,
): ArticleGroup {
  if (status === 'PUBLISHED') return 'done'
  if (canManage && MANAGE_STATUS.includes(status)) return 'mine'
  if (canRespond && RESPOND_STATUS.includes(status)) return 'mine'
  return 'waiting'
}

export interface ArticleFileEntry extends BlogArticleFile {
  stageCode: BlogStageCode
  /** null = ไฟล์เดิมที่อัปก่อนมีระบบส่งเป็นรอบ */
  round: number | null
}

/** ไฟล์ทั้งหมดของบทความ (submission + legacy) เรียงใหม่ → เก่า */
export function collectArticleFiles(article: BlogArticle): ArticleFileEntry[] {
  const fromSubmissions = article.submissions.flatMap((submission) =>
    submission.files.map((file) => ({
      ...file,
      stageCode: submission.stageCode,
      round: submission.round,
    })),
  )
  const fromLegacy = article.legacyFiles.map((file) => ({
    ...file,
    stageCode: LEGACY_FILE_STAGE[file.kind],
    round: null,
  }))

  return [...fromSubmissions, ...fromLegacy].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}
