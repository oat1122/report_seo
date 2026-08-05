import { NotFoundError } from '@/lib/errors'
import type { BlogArticle } from '../../domain/BlogArticle'
import { buildStageSchedule, getFlowStages } from '../../domain/policies/stage-schedule'
import type { BlogArticleRepository } from '../ports/BlogArticleRepository'
import type { BlogSettingsRepository } from '../ports/BlogSettingsRepository'
import type { CreateArticleInput } from '../../schemas'

export function createArticleUseCase(
  articles: BlogArticleRepository,
  settings: BlogSettingsRepository,
) {
  return async (
    customerId: string,
    input: CreateArticleInput,
    createdById: string | null,
  ): Promise<BlogArticle> => {
    const config = await settings.get(customerId)
    if (!config) throw new NotFoundError('ไม่พบลูกค้า')

    return articles.create({
      customerId,
      title: input.title,
      keyFocus: input.keyFocus,
      targetYear: input.targetYear,
      targetMonth: input.targetMonth,
      startDate: input.startDate,
      note: input.note,
      createdById,
      stages: buildStageSchedule(input.startDate, getFlowStages(config.blogRequiresApproval)),
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
