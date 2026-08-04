import { NotFoundError } from '@/lib/errors'
import type { BlogArticleStatus } from '../../domain/BlogArticle'
import { deriveArticleStatus } from '../../domain/policies/article-status'
import type { BlogArticleRepository } from '../ports/BlogArticleRepository'

/** อ่านสถานะ stage/feedback ล่าสุดแล้วเขียน status ที่ derive ได้กลับลง DB */
export async function recalculateStatus(
  articles: BlogArticleRepository,
  articleId: string,
  customerId: string,
): Promise<BlogArticleStatus> {
  const article = await articles.findByIdForCustomer(articleId, customerId)
  if (!article) throw new NotFoundError('ไม่พบบทความ')

  const status = deriveArticleStatus({
    submittedStageCodes: article.stages.filter((s) => s.submittedAt).map((s) => s.stageCode),
    latestFeedback: article.feedbacks[0]
      ? { stageCode: article.feedbacks[0].stageCode, decision: article.feedbacks[0].decision }
      : null,
  })

  if (status !== article.status) {
    await articles.setStatus(articleId, status)
  }
  return status
}
