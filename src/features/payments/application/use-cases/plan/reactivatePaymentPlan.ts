import { NotFoundError, BadRequestError } from '@/lib/errors'
import type { PaymentRepository } from '../../ports/PaymentRepository'

export function reactivatePaymentPlanUseCase(repo: PaymentRepository) {
  return async (customerId: string, planId: string) => {
    const existing = await repo.findPlanById(planId)
    if (!existing || existing.customerId !== customerId) throw new NotFoundError('ไม่พบแผนชำระเงิน')
    if (existing.status !== 'CANCELLED') {
      throw new BadRequestError('ย้อนสถานะได้เฉพาะแผนที่ถูกยกเลิก')
    }
    return repo.reactivateCancelledPlan(planId)
  }
}
