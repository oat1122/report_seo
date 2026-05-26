import type { BillingDocumentRepository } from "../../ports/BillingDocumentRepository";
import type { DocumentItemInput } from "../../ports/BillingDocumentRepository";

export function upsertDocumentItemsUseCase(repo: BillingDocumentRepository) {
  return (customerId: string, items: DocumentItemInput[]) =>
    repo.upsertDocumentItems(customerId, items);
}
