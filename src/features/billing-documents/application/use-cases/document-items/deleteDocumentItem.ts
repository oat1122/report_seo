import type { BillingDocumentRepository } from "../../ports/BillingDocumentRepository";

export function deleteDocumentItemUseCase(repo: BillingDocumentRepository) {
  return (itemId: string) => repo.deleteDocumentItem(itemId);
}
