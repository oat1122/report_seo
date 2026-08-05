import type { BlogFileKind, BlogStageCode } from '../BlogArticle'

export type StageActor = 'WRITER' | 'CLIENT'

export interface BlogStageDefinition {
  code: BlogStageCode
  seq: number
  actor: StageActor
  label: string
  /** ชื่อสั้นภาษาชาวบ้านสำหรับหน้าลูกค้า — "คุณ" = ลูกค้า, "ทีม" = ทีมเขียน */
  clientLabel: string
  /** จำนวนวันที่ให้ทำ stage นี้ */
  days: number
  /** ชนิดไฟล์ที่แนบได้ตอนส่งงาน stage นี้ — ว่าง = แนบไฟล์ไม่ได้ (ข้อความ/ลิงก์เท่านั้น) */
  fileKinds: readonly BlogFileKind[]
  /** ชนิดไฟล์ที่ต้องแนบให้ครบถึงจะส่งได้ */
  requiredFileKinds: readonly BlogFileKind[]
}

export const BLOG_STAGES: readonly BlogStageDefinition[] = [
  {
    code: 'SUBMIT_TOPIC',
    seq: 1,
    actor: 'WRITER',
    label: 'ส่งหัวข้อ / Main Idea',
    clientLabel: 'ทีมส่งหัวข้อ',
    days: 5,
    fileKinds: ['ARTICLE_DOC'],
    requiredFileKinds: [],
  },
  {
    code: 'CLIENT_FEEDBACK_TOPIC',
    seq: 2,
    actor: 'CLIENT',
    label: 'ลูกค้าตรวจหัวข้อ',
    clientLabel: 'คุณเลือกหัวข้อ',
    days: 4,
    fileKinds: [],
    requiredFileKinds: [],
  },
  {
    code: 'SUBMIT_ARTICLE',
    seq: 3,
    actor: 'WRITER',
    label: 'ส่งบทความฉบับเต็ม',
    clientLabel: 'ทีมส่งบทความ',
    days: 5,
    fileKinds: ['ARTICLE_DOC'],
    requiredFileKinds: [],
  },
  {
    code: 'CLIENT_FEEDBACK_ARTICLE',
    seq: 4,
    actor: 'CLIENT',
    label: 'ลูกค้าตรวจบทความ',
    clientLabel: 'คุณอ่านบทความ',
    days: 5,
    fileKinds: [],
    requiredFileKinds: [],
  },
  {
    code: 'SUBMIT_FINAL',
    seq: 5,
    actor: 'WRITER',
    label: 'ส่งไฟล์ final + ภาพปก',
    clientLabel: 'ทีมส่งไฟล์ final',
    days: 4,
    fileKinds: ['ARTICLE_DOC', 'COVER_IMAGE'],
    requiredFileKinds: ['ARTICLE_DOC', 'COVER_IMAGE'],
  },
] as const

export const BLOG_FILE_KIND_LABELS: Record<BlogFileKind, string> = {
  ARTICLE_DOC: 'ไฟล์บทความ',
  COVER_IMAGE: 'ภาพปก',
}

/** ลูกค้าที่ไม่ต้องตรวจงาน — writer อัปไฟล์ final + ภาพปกครั้งเดียวจบ */
const FAST_TRACK_STAGES: readonly BlogStageDefinition[] = BLOG_STAGES.filter(
  (stage) => stage.code === 'SUBMIT_FINAL',
)

/** flow ที่จะใช้กับบทความใหม่ของลูกค้ารายนี้ */
export function getFlowStages(requiresApproval: boolean): readonly BlogStageDefinition[] {
  return requiresApproval ? BLOG_STAGES : FAST_TRACK_STAGES
}

/**
 * flow จริงของบทความ 1 ชิ้น = stage row ที่มีอยู่ (ตั้งตอนสร้าง และ sync ใหม่เมื่อ admin สลับโหมด)
 * — บทความที่ยังไม่มี row เลยให้ถอยไปใช้ flow เต็ม
 */
export function getArticleFlow(
  stages: readonly { stageCode: BlogStageCode }[],
): readonly BlogStageDefinition[] {
  const present = new Set(stages.map((stage) => stage.stageCode))
  const flow = BLOG_STAGES.filter((stage) => present.has(stage.code))
  return flow.length > 0 ? flow : BLOG_STAGES
}

/** ไฟล์เก่าที่ไม่มี submission ให้ไปแสดงใต้ stage นี้ตามชนิดไฟล์ */
export const LEGACY_FILE_STAGE: Record<BlogFileKind, BlogStageCode> = {
  ARTICLE_DOC: 'SUBMIT_ARTICLE',
  COVER_IMAGE: 'SUBMIT_FINAL',
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

/** stage ของ writer ที่อยู่ก่อน stage ของลูกค้าใน flow เดียวกัน — ใช้ย้อนกลับเมื่อลูกค้าขอแก้ */
export function getPrecedingWriterStage(
  code: BlogStageCode,
  flow: readonly BlogStageDefinition[] = BLOG_STAGES,
): BlogStageCode | null {
  const index = flow.findIndex((stage) => stage.code === code)
  for (let i = index - 1; i >= 0; i -= 1) {
    if (flow[i].actor === 'WRITER') return flow[i].code
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

  return getArticleFlow(stages).flatMap((definition) => {
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
 * ไล่ dueDate ต่อเนื่องจาก startDate ตามจำนวนวันของแต่ละ stage ใน flow
 * startDate = null → ยังไม่กำหนดวัน ให้ผู้ใช้กรอกเองทีหลัง
 */
export function buildStageSchedule(
  startDate: Date | null,
  flow: readonly BlogStageDefinition[],
): ScheduledStage[] {
  let cursor = startDate ? new Date(startDate) : null

  return flow.map((stage, index) => {
    if (!cursor) {
      return { stageCode: stage.code, seq: index + 1, dueDate: null }
    }
    const dueDate = new Date(cursor)
    dueDate.setDate(dueDate.getDate() + stage.days)
    cursor = dueDate
    return { stageCode: stage.code, seq: index + 1, dueDate }
  })
}
