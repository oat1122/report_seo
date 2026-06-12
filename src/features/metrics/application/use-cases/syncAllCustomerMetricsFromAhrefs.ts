import type { CustomerDirectory } from '../ports/CustomerDirectory'
import type {
  CustomerSyncResult,
  syncCustomerMetricsFromAhrefsUseCase,
} from './syncCustomerMetricsFromAhrefs'

export interface BatchSyncSummary {
  date: string
  total: number
  updated: number
  skipped: number
  errors: number
  results: CustomerSyncResult[]
}

export function syncAllCustomerMetricsFromAhrefsUseCase(
  directory: CustomerDirectory,
  syncOne: ReturnType<typeof syncCustomerMetricsFromAhrefsUseCase>,
) {
  return async (date: string): Promise<BatchSyncSummary> => {
    const targets = await directory.listSyncTargets()
    const results: CustomerSyncResult[] = []
    // sequential — เคารพ rate limit ของ Ahrefs; syncOne จับ error รายคนอยู่แล้ว batch จึงไม่ล้ม
    for (const target of targets) {
      results.push(await syncOne(target, date))
    }
    return {
      date,
      total: results.length,
      updated: results.filter((r) => r.status === 'updated').length,
      skipped: results.filter((r) => r.status === 'skipped_no_metrics').length,
      errors: results.filter((r) => r.status === 'error').length,
      results,
    }
  }
}
