import { BadRequestError, NotFoundError } from '@/lib/errors'
import type { BlogArticleStatus, BlogStageCode } from '../../domain/BlogArticle'
import { isClientStage } from '../../domain/policies/stage-schedule'
import type { BlogArticleRepository, StagePatch } from '../ports/BlogArticleRepository'
import type { UpdateStageInput } from '../../schemas'
import { recalculateStatus } from './recalculateStatus'

export interface UpdateStageResult {
  status: BlogArticleStatus
  stageCode: BlogStageCode
  submitted: boolean
}

/**
 * ใช้โดย writer/admin เท่านั้น — stage ของลูกค้าต้องผ่าน submitClientFeedback
 * เพื่อให้ทุกครั้งที่ลูกค้าตอบมีเหตุผล (decision + comment) บันทึกไว้
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

    const patch: StagePatch = {}
    if (input.dueDate !== undefined) patch.dueDate = input.dueDate
    if (input.note !== undefined) patch.note = input.note
    if (input.submitted !== undefined) patch.submittedAt = input.submitted ? new Date() : null

    await articles.patchStage(articleId, stageCode, patch)

    const status = await recalculateStatus(articles, articleId, customerId)
    return { status, stageCode, submitted: input.submitted ?? false }
  }
}
