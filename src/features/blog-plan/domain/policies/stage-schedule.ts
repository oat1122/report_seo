import type { BlogFileKind, BlogStageCode } from '../BlogArticle'

export type StageActor = 'WRITER' | 'CLIENT'

export interface BlogStageDefinition {
  code: BlogStageCode
  seq: number
  actor: StageActor
  label: string
  /** ชื่อสั้นภาษาชาวบ้านสำหรับหน้าลูกค้า — "คุณ" = ลูกค้า, "ทีม" = ทีมเขียน */
  clientLabel: string
  /** จำนวนวันที่ให้ทำ stage นี้ — ตัวเลขในวงเล็บบนหัวคอลัมน์ของฟอร์ม SEO Prime */
  days: number
  /** ชนิดไฟล์ที่แนบได้ตอนส่งงาน stage นี้ — null = แนบไฟล์ไม่ได้ (ข้อความ/ลิงก์เท่านั้น) */
  fileKind: BlogFileKind | null
}

export const BLOG_STAGES: readonly BlogStageDefinition[] = [
  {
    code: 'SUBMIT_TOPIC',
    seq: 1,
    actor: 'WRITER',
    label: 'ส่งหัวข้อ / Main Idea',
    clientLabel: 'ทีมส่งหัวข้อ',
    days: 5,
    fileKind: 'ARTICLE_DOC',
  },
  {
    code: 'CLIENT_FEEDBACK_TOPIC',
    seq: 2,
    actor: 'CLIENT',
    label: 'ลูกค้าให้ความเห็นหัวข้อ',
    clientLabel: 'คุณเลือกหัวข้อ',
    days: 4,
    fileKind: null,
  },
  {
    code: 'SUBMIT_ARTICLE',
    seq: 3,
    actor: 'WRITER',
    label: 'ส่งบทความฉบับเต็ม',
    clientLabel: 'ทีมส่งบทความ',
    days: 5,
    fileKind: 'ARTICLE_DOC',
  },
  {
    code: 'CLIENT_FEEDBACK_ARTICLE',
    seq: 4,
    actor: 'CLIENT',
    label: 'ลูกค้าให้ความเห็นบทความ',
    clientLabel: 'คุณอ่านบทความ',
    days: 5,
    fileKind: null,
  },
  {
    code: 'SUBMIT_ARTWORK',
    seq: 5,
    actor: 'WRITER',
    label: 'ส่งภาพประกอบ / ภาพปก',
    clientLabel: 'ทีมส่งภาพ',
    days: 4,
    fileKind: 'COVER_IMAGE',
  },
  {
    code: 'CLIENT_FINAL_APPROVAL',
    seq: 6,
    actor: 'CLIENT',
    label: 'ลูกค้าอนุมัติขั้นสุดท้าย',
    clientLabel: 'คุณอนุมัติ',
    days: 5,
    fileKind: null,
  },
  {
    code: 'UPLOAD_ON_WEBSITE',
    seq: 7,
    actor: 'WRITER',
    label: 'อัปโหลดขึ้นเว็บไซต์',
    clientLabel: 'ทีมลงเว็บ',
    days: 0,
    fileKind: null,
  },
] as const

/** ไฟล์เก่าที่ไม่มี submission ให้ไปแสดงใต้ stage นี้ตามชนิดไฟล์ */
export const LEGACY_FILE_STAGE: Record<BlogFileKind, BlogStageCode> = {
  ARTICLE_DOC: 'SUBMIT_ARTICLE',
  COVER_IMAGE: 'SUBMIT_ARTWORK',
}

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

export interface StageWindow {
  stageCode: BlogStageCode
  seq: number
  actor: StageActor
  start: Date
  end: Date
}

/**
 * ช่วงเวลาของแต่ละ stage สำหรับวาดไทม์ไลน์รายเดือน
 * ต้นทางของ stage N = dueDate ของ stage ก่อนหน้า (stage แรกใช้ startDate ของบทความ)
 * stage ที่ยังไม่มี dueDate จะถูกข้าม และไม่ถูกใช้เป็นต้นทางของ stage ถัดไป
 */
export function buildStageWindows(
  startDate: Date | null,
  stages: readonly { stageCode: BlogStageCode; dueDate: Date | null }[],
): StageWindow[] {
  const dueByCode = new Map(stages.map((stage) => [stage.stageCode, stage.dueDate]))
  let cursor = startDate ? new Date(startDate) : null

  return BLOG_STAGES.flatMap((definition) => {
    const rawDue = dueByCode.get(definition.code)
    if (!rawDue) return []

    const end = new Date(rawDue)
    const start = cursor ?? end
    cursor = end
    return [
      { stageCode: definition.code, seq: definition.seq, actor: definition.actor, start, end },
    ]
  })
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
