import { NotFoundError, BadRequestError } from '@/lib/errors'
import type { PaymentRepository } from '../../ports/PaymentRepository'

export function cancelPaymentPlanUseCase(repo: PaymentRepository) {
  return async (customerId: string, planId: string) => {
    const existing = await repo.findPlanById(planId)
    if (!existing || existing.customerId !== customerId) throw new NotFoundError('ไม่พบแผนชำระเงิน')
    if (existing.status !== 'ACTIVE') {
      throw new BadRequestError('ยกเลิกได้เฉพาะแผนที่สถานะ ACTIVE')
    }
    return repo.cancelPlan(planId)
  }
}
