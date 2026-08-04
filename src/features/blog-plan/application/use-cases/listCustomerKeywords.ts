import type { CustomerKeywordOption } from '../../domain/BlogArticle'
import type { BlogArticleRepository } from '../ports/BlogArticleRepository'
import type { BlogKeywordReader } from '../ports/BlogKeywordReader'

/**
 * รวม keyword ที่ track อยู่ (KeywordReport) กับที่ทีม SEO แนะนำ (KeywordRecommend)
 * แล้วติดจำนวนบทความที่ใช้ keyword นั้นไปแล้ว — จับคู่ด้วยข้อความ ไม่ใช่ FK
 * เพราะ keyword มาจากคนละตารางและ writer พิมพ์เองก็ได้
 */
export function listCustomerKeywordsUseCase(
  keywords: BlogKeywordReader,
  articles: BlogArticleRepository,
) {
  return async (customerId: string): Promise<CustomerKeywordOption[]> => {
    const [options, usage] = await Promise.all([
      keywords.listByCustomer(customerId),
      articles.countArticlesPerKeyword(customerId),
    ])

    return options.map((option) => ({
      ...option,
      usedCount: usage.get(option.keyword.toLowerCase()) ?? 0,
    }))
  }
}
