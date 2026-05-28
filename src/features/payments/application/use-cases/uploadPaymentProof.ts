import type { PaymentRepository } from '../ports/PaymentRepository'
import type { PaymentImageStorage } from '../ports/PaymentImageStorage'

export function uploadPaymentProofUseCase(repo: PaymentRepository, storage: PaymentImageStorage) {
  return async (file: File, customerInternalId: string, billingCycleId?: string) => {
    const saved = await storage.validateAndWrite(file)
    try {
      const proof = await repo.createProof(customerInternalId, saved.url, billingCycleId)

      if (billingCycleId) {
        const cycle = await repo.findCycleById(billingCycleId)
        if (cycle && (cycle.status === 'PENDING' || cycle.status === 'OVERDUE')) {
          await repo.updateCycle(billingCycleId, { status: 'REVIEWING' })
        }
      }

      return proof
    } catch (error) {
      await storage.removeByAbsolutePath(saved.absolutePath)
      throw error
    }
  }
}
