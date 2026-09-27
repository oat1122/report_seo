import { NotFoundError } from '@/lib/errors'
import type { PaymentRepository, UpdatePlanData } from '../../ports/PaymentRepository'

export function updatePaymentPlanUseCase(repo: PaymentRepository) {
  return async (customerId: string, planId: string, data: UpdatePlanData) => {
    const existing = await repo.findPlanById(planId)
    if (!existing || existing.customerId !== customerId) throw new NotFoundError('ไม่พบแผนชำระเงิน')

    const updated = await repo.updatePlan(planId, data)

    if (data.amount != null) {
      await repo.updatePendingCyclesAmount(planId, data.amount)
    }

    return updated
  }
}
