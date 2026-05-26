import type { BillingDocumentRepository } from "../../ports/BillingDocumentRepository";

export function listDocumentItemsUseCase(repo: BillingDocumentRepository) {
  return (customerId: string) => repo.listDocumentItems(customerId);
}
