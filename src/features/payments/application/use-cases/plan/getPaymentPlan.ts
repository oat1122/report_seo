import { NotFoundError } from '@/lib/errors'
import type { PaymentRepository } from '../../ports/PaymentRepository'

export function getPaymentPlanUseCase(repo: PaymentRepository) {
  return async (customerId: string, planId: string) => {
    const plan = await repo.findPlanById(planId)
    if (!plan || plan.customerId !== customerId) throw new NotFoundError('ไม่พบแผนชำระเงิน')
    return plan
  }
}
