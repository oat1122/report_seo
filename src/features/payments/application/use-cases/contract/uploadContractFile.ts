import type { PaymentRepository } from '../../ports/PaymentRepository'
import type { ContractFileStorage } from '../../ports/ContractFileStorage'

export function uploadContractFileUseCase(repo: PaymentRepository, storage: ContractFileStorage) {
  return async (file: File, customerId: string) => {
    const saved = await storage.validateAndWrite(file)
    try {
      return await repo.createContractFile(customerId, saved.url, saved.fileName)
    } catch (error) {
      await storage.removeByAbsolutePath(saved.absolutePath)
      throw error
    }
  }
}
