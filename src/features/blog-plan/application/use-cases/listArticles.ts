import type { BlogArticle } from '../../domain/BlogArticle'
import type { BlogArticleRepository } from '../ports/BlogArticleRepository'
import type { ListArticlesQuery } from '../../schemas'

export interface ArticleListResult {
  articles: BlogArticle[]
  /** จำนวนบทความในเดือนที่ filter — ใช้เทียบกับโควตา articlesPerMonth */
  monthlyCount: number | null
}

export function listArticlesUseCase(articles: BlogArticleRepository) {
  return async (customerId: string, query: ListArticlesQuery): Promise<ArticleListResult> => {
    const list = await articles.listByCustomer(customerId, query)
    const monthlyCount =
      query.year && query.month
        ? await articles.countByMonth(customerId, query.year, query.month)
        : null

    return { articles: list, monthlyCount }
  }
}
