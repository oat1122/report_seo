import type { BlogArticle } from '../../domain/BlogArticle'
import { buildStageSchedule } from '../../domain/policies/stage-schedule'
import type { BlogArticleRepository } from '../ports/BlogArticleRepository'
import type { CreateArticleInput } from '../../schemas'

export function createArticleUseCase(articles: BlogArticleRepository) {
  return async (
    customerId: string,
    input: CreateArticleInput,
    createdById: string | null,
  ): Promise<BlogArticle> => {
    return articles.create({
      customerId,
      title: input.title,
      keyFocus: input.keyFocus,
      targetYear: input.targetYear,
      targetMonth: input.targetMonth,
      startDate: input.startDate,
      note: input.note,
      createdById,
      stages: buildStageSchedule(input.startDate),
      keywords: dedupeKeywords(input.keywords),
    })
  }
}

/** กัน unique([articleId, keyword]) ชนเมื่อ UI ส่งซ้ำ */
export function dedupeKeywords<T extends { keyword: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.keyword.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
