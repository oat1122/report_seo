import type { BillingDocumentRepository } from '../ports/BillingDocumentRepository'

export function getDocumentUseCase(repo: BillingDocumentRepository) {
  return (documentId: string) => repo.getDocument(documentId)
}
