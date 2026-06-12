import { NotFoundError } from '@/lib/errors'
import type { CustomerDirectory } from '../ports/CustomerDirectory'
import type { AhrefsFullMetrics, AhrefsMetricsGateway } from '../ports/AhrefsMetricsGateway'

export interface AhrefsPreviewResult {
  customerId: string
  domain: string
  fetched: AhrefsFullMetrics
}

// ดึงค่าจาก Ahrefs มาดูก่อน (ไม่เขียน DB) — ใช้กับปุ่มซิงก์ในโมดอล
export function previewCustomerAhrefsMetricsUseCase(
  directory: CustomerDirectory,
  ahrefs: AhrefsMetricsGateway,
) {
  return async (userId: string, date: string): Promise<AhrefsPreviewResult> => {
    const target = await directory.findSyncTargetByUserId(userId)
    if (!target) throw new NotFoundError('ไม่พบลูกค้า')
    const fetched = await ahrefs.fetchFullMetrics(target.domain, date)
    return { customerId: target.customerId, domain: target.domain, fetched }
  }
}
