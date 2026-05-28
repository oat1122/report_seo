import type { Customer } from '../../domain/Customer'

export interface CustomerRepository {
  findByUserId(userId: string): Promise<Customer | null>
  findById(id: string): Promise<Customer | null>
  findByKeywordId(keywordId: string): Promise<Customer | null>
  findByRecommendId(recommendId: string): Promise<Customer | null>
  findByAiOverviewId(aiOverviewId: string): Promise<Customer | null>
}
