import type { CustomerReportSnapshot } from '../../domain/CustomerReportSnapshot'
import type { CustomerProfileRepository } from '../ports/CustomerProfileRepository'
import { getMetrics } from '@/features/metrics'
import { getKeywords } from '@/features/keywords'
import { listRecommendations } from '@/features/recommendations'
import { listAiOverviews } from '@/features/ai-overview'

export function getCustomerReportUseCase(profiles: CustomerProfileRepository) {
  return async (customerUserId: string): Promise<CustomerReportSnapshot> => {
    const customer = await profiles.findByUserId(customerUserId)

    if (!customer) {
      return {
        metrics: null,
        topKeywords: [],
        otherKeywords: [],
        recommendations: [],
        aiOverviews: [],
        customerName: null,
        domain: null,
      }
    }

    const [metrics, keywords, recommendations, aiOverviews] = await Promise.all([
      getMetrics(customer.id),
      getKeywords(customer.id),
      listRecommendations(customer.id),
      listAiOverviews(customer.id),
    ])

    const sortedKeywords = [...keywords].sort((a, b) => {
      if (a.isTopReport !== b.isTopReport) return a.isTopReport ? -1 : 1
      const aPos = a.position ?? Number.POSITIVE_INFINITY
      const bPos = b.position ?? Number.POSITIVE_INFINITY
      return aPos - bPos
    })

    return {
      metrics,
      topKeywords: sortedKeywords.filter((kw) => kw.isTopReport),
      otherKeywords: sortedKeywords.filter((kw) => !kw.isTopReport),
      recommendations,
      aiOverviews,
      customerName: customer.customerName,
      domain: customer.domain,
    }
  }
}
