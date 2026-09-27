import type { PaymentRepository } from '../../ports/PaymentRepository'

export function listBillingCyclesUseCase(repo: PaymentRepository) {
  return (customerId: string, planId?: string) => {
    if (planId) {
      return repo.listCyclesByPlan(planId, customerId)
    }
    return repo.listCyclesByCustomer(customerId)
  }
}
