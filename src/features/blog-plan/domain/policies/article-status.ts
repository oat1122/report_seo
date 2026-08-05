import type { BlogArticleStatus, BlogFeedbackDecision, BlogStageCode } from '../BlogArticle'
import { getStageDefinition, type BlogStageDefinition } from './stage-schedule'

export interface StatusInput {
  /** ขั้นตอนของบทความชิ้นนี้ตามลำดับ — ต่างกันได้ระหว่างลูกค้าที่ตรวจงานกับที่ไม่ตรวจ */
  flow: readonly BlogStageDefinition[]
  submittedStageCodes: readonly BlogStageCode[]
  latestFeedback: { stageCode: BlogStageCode; decision: BlogFeedbackDecision } | null
}

/**
 * status เป็นค่า derive ล้วน — เก็บลง DB เพื่อให้ filter/sort ได้ แต่ต้องคำนวณใหม่ทุกครั้ง
 * ที่ stage หรือ feedback เปลี่ยน (ห้ามให้ client ส่ง status มาเอง)
 */
export function deriveArticleStatus({
  flow,
  submittedStageCodes,
  latestFeedback,
}: StatusInput): BlogArticleStatus {
  const submitted = new Set(submittedStageCodes)

  if (submitted.size === 0) return 'DRAFT'

  const nextStage = flow.find((stage) => !submitted.has(stage.code))
  if (!nextStage) return 'PUBLISHED'

  if (latestFeedback?.decision === 'CHANGES_REQUESTED' && nextStage.actor === 'WRITER') {
    return 'CHANGES_REQUESTED'
  }
  if (nextStage.actor === 'CLIENT') return 'WAITING_CLIENT'

  return 'IN_PROGRESS'
}

/** stage ถัดไปที่รอดำเนินการ — null เมื่อจบครบทุก stage ของ flow */
export function getNextPendingStage(
  flow: readonly BlogStageDefinition[],
  submittedStageCodes: readonly BlogStageCode[],
): BlogStageCode | null {
  const submitted = new Set(submittedStageCodes)
  return flow.find((stage) => !submitted.has(stage.code))?.code ?? null
}

export const BLOG_ARTICLE_STATUS_LABELS: Record<BlogArticleStatus, string> = {
  DRAFT: 'ร่าง',
  IN_PROGRESS: 'กำลังดำเนินการ',
  WAITING_CLIENT: 'รอลูกค้าตอบ',
  CHANGES_REQUESTED: 'ลูกค้าขอแก้ไข',
  PUBLISHED: 'เสร็จสิ้น',
}

export function getStageLabel(code: BlogStageCode): string {
  return getStageDefinition(code).label
}

/** ชื่อขั้นตอนแบบสั้นสำหรับหน้าลูกค้า — ห้ามใช้ใน notification/หน้า manage (ใช้ getStageLabel) */
export function getClientStageLabel(code: BlogStageCode): string {
  return getStageDefinition(code).clientLabel
}
