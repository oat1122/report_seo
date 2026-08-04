import { BadRequestError, NotFoundError } from '@/lib/errors'
import type { BlogArticleStatus, BlogStageCode } from '../../domain/BlogArticle'
import { isClientStage } from '../../domain/policies/stage-schedule'
import type { BlogArticleRepository, StagePatch } from '../ports/BlogArticleRepository'
import type { UpdateStageInput } from '../../schemas'
import { recalculateStatus } from './recalculateStatus'

export interface UpdateStageResult {
  status: BlogArticleStatus
  stageCode: BlogStageCode
}

/**
 * ใช้โดย writer/admin แก้ dueDate/note และ "ยกเลิกการส่ง" เท่านั้น
 * - การส่งงานต้องผ่าน submitStageWork เพื่อให้มีเนื้อหาส่งถึงลูกค้าเสมอ
 * - stage ของลูกค้าต้องผ่าน submitClientFeedback เพื่อให้มีเหตุผล (decision + comment) บันทึกไว้
 */
export function updateStageUseCase(articles: BlogArticleRepository) {
  return async (
    articleId: string,
    customerId: string,
    stageCode: BlogStageCode,
    input: UpdateStageInput,
  ): Promise<UpdateStageResult> => {
    const article = await articles.findByIdForCustomer(articleId, customerId)
    if (!article) throw new NotFoundError('ไม่พบบทความ')

    if (isClientStage(stageCode) && input.submitted !== undefined) {
      throw new BadRequestError('ขั้นตอนนี้ต้องให้ลูกค้าเป็นผู้ตอบ')
    }
    if (input.submitted === true) {
      throw new BadRequestError('ต้องส่งงานพร้อมเนื้อหาให้ลูกค้าผ่านหน้าส่งงาน')
    }

    const patch: StagePatch = {}
    if (input.dueDate !== undefined) patch.dueDate = input.dueDate
    if (input.note !== undefined) patch.note = input.note
    if (input.submitted === false) patch.submittedAt = null

    await articles.patchStage(articleId, stageCode, patch)

    const status = await recalculateStatus(articles, articleId, customerId)
    return { status, stageCode }
  }
}
