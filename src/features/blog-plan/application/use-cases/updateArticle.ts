import { NotFoundError } from '@/lib/errors'
import { buildStageSchedule, getArticleFlow } from '../../domain/policies/stage-schedule'
import type { BlogArticleRepository } from '../ports/BlogArticleRepository'
import type { UpdateArticleInput } from '../../schemas'
import { dedupeKeywords } from './createArticle'

export function updateArticleUseCase(articles: BlogArticleRepository) {
  return async (
    articleId: string,
    customerId: string,
    input: UpdateArticleInput,
  ): Promise<void> => {
    const existing = await articles.findByIdForCustomer(articleId, customerId)
    if (!existing) throw new NotFoundError('ไม่พบบทความ')

    const { keywords, ...fields } = input
    await articles.update(articleId, fields)

    if (keywords) {
      await articles.replaceKeywords(articleId, dedupeKeywords(keywords))
    }

    // เลื่อน startDate = เลื่อน due date ทั้ง pipeline แต่ไม่แตะ submittedAt ที่เกิดขึ้นจริงแล้ว
    if (input.startDate !== undefined) {
      for (const stage of buildStageSchedule(input.startDate, getArticleFlow(existing.stages))) {
        await articles.patchStage(articleId, stage.stageCode, { dueDate: stage.dueDate })
      }
    }
  }
}
