import type {
  BillingDocumentRepository,
  UpdateCustomerInfoInput,
} from '../ports/BillingDocumentRepository'

export function updateCustomerInfoUseCase(repo: BillingDocumentRepository) {
  return async (customerId: string, input: UpdateCustomerInfoInput) => {
    await repo.updateCustomerInfo(customerId, input)
  }
}
