import { PrismaBillingDocumentRepository } from "./infrastructure/PrismaBillingDocumentRepository";
import { LocalDocumentStorage } from "./infrastructure/LocalDocumentStorage";
import { PuppeteerPdfRenderer } from "./infrastructure/PuppeteerPdfRenderer";
import { renderDocumentHtml } from "./infrastructure/templates/render-document";
import { getCompanySettings } from "@/features/company-settings";

import { listDocumentItemsUseCase } from "./application/use-cases/document-items/listDocumentItems";
import { upsertDocumentItemsUseCase } from "./application/use-cases/document-items/upsertDocumentItems";
import { deleteDocumentItemUseCase } from "./application/use-cases/document-items/deleteDocumentItem";
import { generateDocumentUseCase } from "./application/use-cases/generateDocument";
import { listDocumentsUseCase } from "./application/use-cases/listDocuments";
import { getDocumentUseCase } from "./application/use-cases/getDocument";
import { deleteDocumentUseCase } from "./application/use-cases/deleteDocument";

const repo = new PrismaBillingDocumentRepository();
const storage = new LocalDocumentStorage();
const renderer = new PuppeteerPdfRenderer();

export const listDocumentItems = listDocumentItemsUseCase(repo);
export const upsertDocumentItems = upsertDocumentItemsUseCase(repo);
export const deleteDocumentItem = deleteDocumentItemUseCase(repo);

export const generateDocument = generateDocumentUseCase({
  repo,
  storage,
  renderer,
  getCompanySettings,
  renderDocumentHtml,
});
export const listDocuments = listDocumentsUseCase(repo);
export const getDocument = getDocumentUseCase(repo);
export const deleteDocument = deleteDocumentUseCase(repo, storage);

export {
  generateDocumentSchema,
  upsertDocumentItemsSchema,
  documentItemSchema,
} from "./schemas";
export type {
  GenerateDocumentInput,
  UpsertDocumentItemsInput,
  DocumentItemInput,
} from "./schemas";

export type { BillingDocument } from "./domain/BillingDocument";
export type { DocumentItem } from "./domain/DocumentItem";
export type { BillingDocumentType } from "./domain/DocumentType";
export { DOCUMENT_TYPE_LABELS } from "./domain/DocumentType";
