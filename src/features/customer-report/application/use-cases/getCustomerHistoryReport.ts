import type { CustomerHistoryReport } from '../../domain/CustomerReportSnapshot'
import { getMetrics, getMetricsHistory } from '@/features/metrics'
import type { MetricsHistoryEntry } from '@/features/metrics'
import { getKeywords, getKeywordHistoryByCustomer } from '@/features/keywords'

export function getCustomerHistoryReportUseCase() {
  return async (
    customerInternalId: string,
    options: { onlyVisible?: boolean } = {},
  ): Promise<CustomerHistoryReport> => {
    const onlyVisible = options.onlyVisible ?? false

    const [history, currentMetrics, currentKeywords, keywordHistory] = await Promise.all([
      getMetricsHistory(customerInternalId, { onlyVisible }),
      getMetrics(customerInternalId),
      getKeywords(customerInternalId),
      getKeywordHistoryByCustomer(customerInternalId, { onlyVisible }),
    ])

    // history desc — prepend current snapshot เป็น data point ล่าสุด
    // เพื่อให้กราฟ trend ไม่จบที่ค่าเก่า (history = ค่า "ก่อน" update)
    const metricsHistory: MetricsHistoryEntry[] = currentMetrics
      ? [
          {
            id: 'current',
            customerId: currentMetrics.customerId,
            domainRating: currentMetrics.domainRating,
            healthScore: currentMetrics.healthScore,
            ageInYears: currentMetrics.ageInYears,
            ageInMonths: currentMetrics.ageInMonths,
            spamScore: currentMetrics.spamScore,
            organicTraffic: currentMetrics.organicTraffic,
            organicKeywords: currentMetrics.organicKeywords,
            backlinks: currentMetrics.backlinks,
            refDomains: currentMetrics.refDomains,
            dateRecorded: new Date(),
            isVisible: true,
          },
          ...history,
        ]
      : history

    const sortedKeywords = [...currentKeywords].sort((a, b) => b.traffic - a.traffic)

    return { metricsHistory, keywordHistory, currentKeywords: sortedKeywords }
  }
}
