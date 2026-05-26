import type {
  BillingDocumentRepository,
  AllDocumentsFilter,
} from "../ports/BillingDocumentRepository";

export function listAllDocumentsUseCase(repo: BillingDocumentRepository) {
  return (filters?: AllDocumentsFilter) => repo.listAllDocuments(filters);
}
