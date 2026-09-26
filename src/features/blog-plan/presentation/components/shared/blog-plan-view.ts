// helper ระดับ view ที่ใช้ร่วมกันหลายการ์ดในหน้าแผนบทความ — pure ทั้งหมด ไม่แตะ React/network

import { getArticleFlow, LEGACY_FILE_STAGE } from '../../../domain/policies/stage-schedule'
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

/**
 * ลิงก์ที่ผู้ใช้พิมพ์ → URL ที่ server รับได้ (zod `z.url()` ต้องมี scheme)
 * "docs.google.com/x" ที่คนพิมพ์กันเป็นปกติจะถูกเติม https:// ให้ · null = ใช้ไม่ได้จริง
 */
export function normalizeLinkUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  // ponytail: try/catch แทน URL.canParse เพราะ canParse ต้อง Chrome 120+/Safari 17+
  try {
    new URL(candidate)
    return candidate
  } catch {
    return null
  }
}

export interface CurrentStage {
  definition: BlogStageDefinition
  /** ลำดับเริ่มที่ 1 — ใช้แสดง "ขั้นที่ N จาก M" */
  step: number
  /** จำนวนขั้นทั้งหมดของบทความนี้ (5 หรือ 1 แล้วแต่โหมดตรวจงานของลูกค้า) */
  total: number
  dueDate: Date | null
}

/** stage ที่ยังไม่ส่ง = ขั้นที่กำลังรออยู่ · null = จบครบทุกขั้นแล้ว */
export function getCurrentStage(article: BlogArticle): CurrentStage | null {
  const flow = getArticleFlow(article.stages)
  const code = getNextPendingStage(
    flow,
    article.stages.filter((stage) => stage.submittedAt).map((stage) => stage.stageCode),
  )
  if (!code) return null

  const step = flow.findIndex((stage) => stage.code === code)
  if (step < 0) return null

  const dueDate = article.stages.find((stage) => stage.stageCode === code)?.dueDate ?? null
  return {
    definition: flow[step],
    step: step + 1,
    total: flow.length,
    dueDate: dueDate ? new Date(dueDate) : null,
  }
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

/** ไฟล์ใน "คลังไฟล์" — พกที่มา (บทความ/เดือน/สถานะ) ติดมาด้วยเพราะรวมมาจากหลายบทความ */
export interface AllFileEntry extends ArticleFileEntry {
  articleId: string
  articleTitle: string
  articleStatus: BlogArticleStatus
  targetYear: number
  targetMonth: number
}

/** ไฟล์ของทุกบทความรวมเป็นลิสต์เดียว เรียงใหม่ → เก่า */
export function collectAllFiles(articles: BlogArticle[]): AllFileEntry[] {
  return articles
    .flatMap((article) =>
      collectArticleFiles(article).map((file) => ({
        ...file,
        articleId: article.id,
        articleTitle: article.title,
        articleStatus: article.status,
        targetYear: article.targetYear,
        targetMonth: article.targetMonth,
      })),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

/** ค่าที่แปลว่า "ไม่กรอง" — ใช้เป็น value ของ Select ด้วย เพราะ shadcn ห้าม SelectItem value ว่าง */
export const FILE_FILTER_ALL = 'all'

export interface FileFilters {
  kind: string
  stageCode: string
  /** 'YYYY-MM' ของเดือนที่บทความสังกัด */
  month: string
  articleId: string
  status: string
  search: string
}

export const EMPTY_FILE_FILTERS: FileFilters = {
  kind: FILE_FILTER_ALL,
  stageCode: FILE_FILTER_ALL,
  month: FILE_FILTER_ALL,
  articleId: FILE_FILTER_ALL,
  status: FILE_FILTER_ALL,
  search: '',
}

/** 'YYYY-MM' — ใช้เป็นทั้ง value ของตัวเลือกเดือนและ key ตอน dedupe */
export function toMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function filterFiles(entries: AllFileEntry[], filters: FileFilters): AllFileEntry[] {
  const search = filters.search.trim().toLowerCase()

  return entries.filter((entry) => {
    if (filters.kind !== FILE_FILTER_ALL && entry.kind !== filters.kind) return false
    if (filters.stageCode !== FILE_FILTER_ALL && entry.stageCode !== filters.stageCode) return false
    if (filters.articleId !== FILE_FILTER_ALL && entry.articleId !== filters.articleId) return false
    if (filters.status !== FILE_FILTER_ALL && entry.articleStatus !== filters.status) return false
    if (
      filters.month !== FILE_FILTER_ALL &&
      toMonthKey(entry.targetYear, entry.targetMonth) !== filters.month
    )
      return false
    if (
      search &&
      !entry.filename.toLowerCase().includes(search) &&
      !entry.articleTitle.toLowerCase().includes(search)
    )
      return false
    return true
  })
}
