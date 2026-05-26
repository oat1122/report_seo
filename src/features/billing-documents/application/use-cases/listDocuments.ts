import type { BillingDocumentRepository } from "../ports/BillingDocumentRepository";
import type { BillingDocumentType } from "../../domain/DocumentType";

export function listDocumentsUseCase(repo: BillingDocumentRepository) {
  return (customerId: string, type?: BillingDocumentType) =>
    repo.listDocuments(customerId, type);
}
