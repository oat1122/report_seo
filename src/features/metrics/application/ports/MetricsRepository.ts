import type { OverallMetrics, MetricsHistoryEntry } from '../../domain/OverallMetrics'
import type { MetricsInput } from '../../schemas'

export interface MetricsRepository {
  findByCustomerId(customerInternalId: string): Promise<OverallMetrics | null>
  upsert(customerInternalId: string, data: MetricsInput): Promise<OverallMetrics>
  findHistory(
    customerInternalId: string,
    options: { onlyVisible: boolean },
  ): Promise<MetricsHistoryEntry[]>
  setVisibility(
    historyId: string,
    isVisible: boolean,
    customerInternalId: string,
  ): Promise<{ updated: number }>
  setVisibilityBulk(
    historyIds: string[],
    isVisible: boolean,
    customerInternalId: string,
  ): Promise<{ updated: number }>
}
