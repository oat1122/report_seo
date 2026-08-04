import type { BlogStageCode } from '../BlogArticle'

export type StageActor = 'WRITER' | 'CLIENT'

export interface BlogStageDefinition {
  code: BlogStageCode
  seq: number
  actor: StageActor
  label: string
  /** จำนวนวันที่ให้ทำ stage นี้ — ตัวเลขในวงเล็บบนหัวคอลัมน์ของฟอร์ม SEO Prime */
  days: number
}

export const BLOG_STAGES: readonly BlogStageDefinition[] = [
  { code: 'SUBMIT_TOPIC', seq: 1, actor: 'WRITER', label: 'ส่งหัวข้อ / Main Idea', days: 5 },
  {
    code: 'CLIENT_FEEDBACK_TOPIC',
    seq: 2,
    actor: 'CLIENT',
    label: 'ลูกค้าให้ความเห็นหัวข้อ',
    days: 4,
  },
  { code: 'SUBMIT_ARTICLE', seq: 3, actor: 'WRITER', label: 'ส่งบทความฉบับเต็ม', days: 5 },
  {
    code: 'CLIENT_FEEDBACK_ARTICLE',
    seq: 4,
    actor: 'CLIENT',
    label: 'ลูกค้าให้ความเห็นบทความ',
    days: 5,
  },
  { code: 'SUBMIT_ARTWORK', seq: 5, actor: 'WRITER', label: 'ส่งภาพประกอบ / ภาพปก', days: 4 },
  {
    code: 'CLIENT_FINAL_APPROVAL',
    seq: 6,
    actor: 'CLIENT',
    label: 'ลูกค้าอนุมัติขั้นสุดท้าย',
    days: 5,
  },
  { code: 'UPLOAD_ON_WEBSITE', seq: 7, actor: 'WRITER', label: 'อัปโหลดขึ้นเว็บไซต์', days: 0 },
] as const

export function getStageDefinition(code: BlogStageCode): BlogStageDefinition {
  const found = BLOG_STAGES.find((stage) => stage.code === code)
  if (!found) {
    throw new Error(`Unknown blog stage: ${code}`)
  }
  return found
}

export function isClientStage(code: BlogStageCode): boolean {
  return getStageDefinition(code).actor === 'CLIENT'
}

/** stage ของ writer ที่อยู่ก่อน stage ของลูกค้า — ใช้ย้อนกลับเมื่อลูกค้าขอแก้ */
export function getPrecedingWriterStage(code: BlogStageCode): BlogStageCode | null {
  const { seq } = getStageDefinition(code)
  for (let i = seq - 2; i >= 0; i -= 1) {
    if (BLOG_STAGES[i].actor === 'WRITER') return BLOG_STAGES[i].code
  }
  return null
}

export interface ScheduledStage {
  stageCode: BlogStageCode
  seq: number
  dueDate: Date | null
}

/**
 * ไล่ dueDate ต่อเนื่องจาก startDate ตามจำนวนวันของแต่ละ stage
 * startDate = null → ยังไม่กำหนดวัน ให้ผู้ใช้กรอกเองทีหลัง
 */
export function buildStageSchedule(startDate: Date | null): ScheduledStage[] {
  let cursor = startDate ? new Date(startDate) : null

  return BLOG_STAGES.map((stage) => {
    if (!cursor) {
      return { stageCode: stage.code, seq: stage.seq, dueDate: null }
    }
    const dueDate = new Date(cursor)
    dueDate.setDate(dueDate.getDate() + stage.days)
    cursor = dueDate
    return { stageCode: stage.code, seq: stage.seq, dueDate }
  })
}
