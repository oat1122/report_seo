import type { MetricsRepository } from '../ports/MetricsRepository'
import type { AhrefsMetricsGateway } from '../ports/AhrefsMetricsGateway'
import type { CustomerSyncTarget } from '../ports/CustomerDirectory'

export type CustomerSyncStatus = 'updated' | 'skipped_no_metrics' | 'error'

export interface CustomerSyncResult {
  customerId: string
  domain: string
  status: CustomerSyncStatus
  error?: string
}

export function syncCustomerMetricsFromAhrefsUseCase(
  metricsRepo: MetricsRepository,
  ahrefs: AhrefsMetricsGateway,
) {
  return async (target: CustomerSyncTarget, date: string): Promise<CustomerSyncResult> => {
    const base = { customerId: target.customerId, domain: target.domain }
    try {
      // อัปเดตเฉพาะลูกค้าที่มีแถว metrics อยู่แล้ว — ไม่สร้างแถว 0-filled ใหม่
      const existing = await metricsRepo.findByCustomerId(target.customerId)
      if (!existing) {
        return { ...base, status: 'skipped_no_metrics' }
      }

      const fresh = await ahrefs.fetchDomainMetrics(target.domain, date)
      // partial update: ส่งแค่ 3 field → upsert(update: data) แตะแค่คอลัมน์เหล่านี้
      // field อื่น (health/spam/traffic/...) คงเดิม, history snapshot ยิงเองจาก middleware
      await metricsRepo.upsert(target.customerId, {
        domainRating: fresh.domainRating,
        backlinks: fresh.backlinks,
        refDomains: fresh.refDomains,
      })

      return { ...base, status: 'updated' }
    } catch (err) {
      return { ...base, status: 'error', error: err instanceof Error ? err.message : String(err) }
    }
  }
}
