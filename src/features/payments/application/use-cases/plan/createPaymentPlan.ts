import type { PaymentRepository, CreatePlanData } from '../../ports/PaymentRepository'
import { generateBillingCycles } from '../../../domain/policies/billing-cycle-generator'

export function createPaymentPlanUseCase(repo: PaymentRepository) {
  return async (customerId: string, data: CreatePlanData) => {
    const cycles = generateBillingCycles({
      type: data.type,
      amount: data.amount,
      startDate: data.startDate,
      billingDay: data.billingDay,
      totalInstallments: data.totalInstallments,
    })

    return repo.createPlanWithCycles(customerId, data, cycles)
  }
}
