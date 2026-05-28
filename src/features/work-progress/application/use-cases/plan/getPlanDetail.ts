import { ForbiddenError, NotFoundError } from '@/lib/errors'
import type { WorkProgressRepository } from '../../ports/WorkProgressRepository'

export function getPlanDetailUseCase(repo: WorkProgressRepository) {
  return async (customerId: string, planId: string) => {
    const detail = await repo.findDetail(planId)
    if (!detail) throw new NotFoundError('ไม่พบแผนงาน')
    if (detail.customerId !== customerId) {
      // กัน path manipulation: planId ของ customer อื่น
      throw new ForbiddenError('ไม่มีสิทธิ์เข้าถึงแผนงานนี้')
    }
    return detail
  }
}
