import type { CustomerKeywordOption } from '../../domain/BlogArticle'

export interface BlogKeywordReader {
  /** keyword ทั้งหมดของลูกค้า รวมจาก KeywordReport + KeywordRecommend (ยังไม่นับ usedCount) */
  listByCustomer(customerId: string): Promise<Omit<CustomerKeywordOption, 'usedCount'>[]>
}
