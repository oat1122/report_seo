import { NotFoundError } from '@/lib/errors'
import type { CustomerDirectory } from '../ports/CustomerDirectory'
import type {
  CustomerSyncResult,
  syncCustomerMetricsFromAhrefsUseCase,
} from './syncCustomerMetricsFromAhrefs'

export function syncCustomerMetricsByUserIdUseCase(
  directory: CustomerDirectory,
  syncOne: ReturnType<typeof syncCustomerMetricsFromAhrefsUseCase>,
) {
  return async (userId: string, date: string): Promise<CustomerSyncResult> => {
    const target = await directory.findSyncTargetByUserId(userId)
    if (!target) throw new NotFoundError('ไม่พบลูกค้า')
    return syncOne(target, date)
  }
}
