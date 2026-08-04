import type { BlogArticleStatus, BlogFeedbackDecision, BlogStageCode } from '../BlogArticle'
import { BLOG_STAGES, getStageDefinition } from './stage-schedule'

export interface StatusInput {
  submittedStageCodes: readonly BlogStageCode[]
  latestFeedback: { stageCode: BlogStageCode; decision: BlogFeedbackDecision } | null
}

/**
 * status เป็นค่า derive ล้วน — เก็บลง DB เพื่อให้ filter/sort ได้ แต่ต้องคำนวณใหม่ทุกครั้ง
 * ที่ stage หรือ feedback เปลี่ยน (ห้ามให้ client ส่ง status มาเอง)
 */
export function deriveArticleStatus({
  submittedStageCodes,
  latestFeedback,
}: StatusInput): BlogArticleStatus {
  const submitted = new Set(submittedStageCodes)

  if (submitted.size === 0) return 'DRAFT'
  if (submitted.has('UPLOAD_ON_WEBSITE')) return 'PUBLISHED'

  const nextStage = BLOG_STAGES.find((stage) => !submitted.has(stage.code))
  if (!nextStage) return 'PUBLISHED'

  if (latestFeedback?.decision === 'CHANGES_REQUESTED' && nextStage.actor === 'WRITER') {
    return 'CHANGES_REQUESTED'
  }
  if (nextStage.actor === 'CLIENT') return 'WAITING_CLIENT'
  if (submitted.has('CLIENT_FINAL_APPROVAL')) return 'APPROVED'

  return 'IN_PROGRESS'
}

/** stage ถัดไปที่รอดำเนินการ — null เมื่อจบครบทุก stage */
export function getNextPendingStage(
  submittedStageCodes: readonly BlogStageCode[],
): BlogStageCode | null {
  const submitted = new Set(submittedStageCodes)
  return BLOG_STAGES.find((stage) => !submitted.has(stage.code))?.code ?? null
}

export const BLOG_ARTICLE_STATUS_LABELS: Record<BlogArticleStatus, string> = {
  DRAFT: 'ร่าง',
  IN_PROGRESS: 'กำลังดำเนินการ',
  WAITING_CLIENT: 'รอลูกค้าตอบ',
  CHANGES_REQUESTED: 'ลูกค้าขอแก้ไข',
  APPROVED: 'อนุมัติแล้ว',
  PUBLISHED: 'เผยแพร่แล้ว',
}

export function getStageLabel(code: BlogStageCode): string {
  return getStageDefinition(code).label
}
