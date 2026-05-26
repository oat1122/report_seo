import type { BillingDocumentRepository } from "../ports/BillingDocumentRepository";
import type { DocumentStorage } from "../ports/DocumentStorage";
import { NotFoundError } from "@/lib/errors";

export function deleteDocumentUseCase(
  repo: BillingDocumentRepository,
  storage: DocumentStorage,
) {
  return async (documentId: string) => {
    const doc = await repo.getDocument(documentId);
    if (!doc) throw new NotFoundError("ไม่พบเอกสาร");

    await storage.deletePdf(doc.pdfUrl);
    await repo.deleteDocument(documentId);
  };
}
