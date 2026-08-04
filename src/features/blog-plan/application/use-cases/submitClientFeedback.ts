import { BadRequestError, NotFoundError } from '@/lib/errors'
import type { BlogArticleStatus } from '../../domain/BlogArticle'
import { getPrecedingWriterStage, isClientStage } from '../../domain/policies/stage-schedule'
import type { BlogArticleRepository } from '../ports/BlogArticleRepository'
import type { SubmitFeedbackInput } from '../../schemas'
import { recalculateStatus } from './recalculateStatus'

export interface FeedbackResult {
  status: BlogArticleStatus
  articleTitle: string
}

export function submitClientFeedbackUseCase(articles: BlogArticleRepository) {
  return async (
    articleId: string,
    customerId: string,
    input: SubmitFeedbackInput,
    authorId: string | null,
  ): Promise<FeedbackResult> => {
    const article = await articles.findByIdForCustomer(articleId, customerId)
    if (!article) throw new NotFoundError('ไม่พบบทความ')

    if (!isClientStage(input.stageCode)) {
      throw new BadRequestError('ขั้นตอนนี้ไม่ใช่ขั้นตอนที่ลูกค้าให้ความเห็น')
    }

    const previousWriterStage = getPrecedingWriterStage(input.stageCode)
    const isWriterStageReady =
      !previousWriterStage ||
      article.stages.some((s) => s.stageCode === previousWriterStage && s.submittedAt)
    if (!isWriterStageReady) {
      throw new BadRequestError('ยังไม่มีงานส่งมาให้พิจารณาในขั้นตอนนี้')
    }

    await articles.addFeedback(articleId, {
      stageCode: input.stageCode,
      decision: input.decision,
      comment: input.comment,
      authorId,
    })

    if (input.decision === 'APPROVED') {
      await articles.patchStage(articleId, input.stageCode, { submittedAt: new Date() })
    } else {
      // ขอแก้ = ย้อน pipeline กลับไปให้ writer ส่งขั้นตอนก่อนหน้าใหม่
      await articles.patchStage(articleId, input.stageCode, { submittedAt: null })
      if (previousWriterStage) {
        await articles.patchStage(articleId, previousWriterStage, { submittedAt: null })
      }
    }

    const status = await recalculateStatus(articles, articleId, customerId)
    return { status, articleTitle: article.title }
  }
}
