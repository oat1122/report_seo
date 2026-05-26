import { PrismaBillingDocumentRepository } from "./infrastructure/PrismaBillingDocumentRepository";
import { LocalDocumentStorage } from "./infrastructure/LocalDocumentStorage";
import { PuppeteerPdfRenderer } from "./infrastructure/PuppeteerPdfRenderer";
import { PrismaBillingCycleProvider } from "./infrastructure/PrismaBillingCycleProvider";
import { renderDocumentHtml } from "./infrastructure/templates/render-document";
import { getCompanySettings } from "@/features/company-settings";

import { listDocumentItemsUseCase } from "./application/use-cases/document-items/listDocumentItems";
import { upsertDocumentItemsUseCase } from "./application/use-cases/document-items/upsertDocumentItems";
import { deleteDocumentItemUseCase } from "./application/use-cases/document-items/deleteDocumentItem";
import { generateDocumentUseCase } from "./application/use-cases/generateDocument";
import { listDocumentsUseCase } from "./application/use-cases/listDocuments";
import { getDocumentUseCase } from "./application/use-cases/getDocument";
import { deleteDocumentUseCase } from "./application/use-cases/deleteDocument";
import { updateDocumentUseCase } from "./application/use-cases/updateDocument";
import { generateAllForCycleUseCase } from "./application/use-cases/generateAllForCycle";
import { listAllDocumentsUseCase } from "./application/use-cases/listAllDocuments";
import { listDocumentsByCyclesUseCase } from "./application/use-cases/listDocumentsByCycles";

const repo = new PrismaBillingDocumentRepository();
const storage = new LocalDocumentStorage();
const renderer = new PuppeteerPdfRenderer();
const cycleProvider = new PrismaBillingCycleProvider();

const commonDeps = { repo, storage, renderer, getCompanySettings, renderDocumentHtml };

export const listDocumentItems = listDocumentItemsUseCase(repo);
export const upsertDocumentItems = upsertDocumentItemsUseCase(repo);
export const deleteDocumentItem = deleteDocumentItemUseCase(repo);

export const generateDocument = generateDocumentUseCase(commonDeps);
export const listDocuments = listDocumentsUseCase(repo);
export const getDocument = getDocumentUseCase(repo);
export const deleteDocument = deleteDocumentUseCase(repo, storage);

export const updateDocument = updateDocumentUseCase(commonDeps);
export const generateAllForCycle = generateAllForCycleUseCase({
  ...commonDeps,
  cycleProvider,
});
export const listAllDocuments = listAllDocumentsUseCase(repo);
export const listDocumentsByCycles = listDocumentsByCyclesUseCase(
  repo,
  cycleProvider,
);

export {
  generateDocumentSchema,
  upsertDocumentItemsSchema,
  documentItemSchema,
  updateDocumentSchema,
  generateAllForCycleSchema,
  listAllDocumentsQuerySchema,
} from "./schemas";
export type {
  GenerateDocumentInput,
  UpsertDocumentItemsInput,
  DocumentItemInput,
  UpdateDocumentInput,
  GenerateAllForCycleInput,
  ListAllDocumentsQuery,
} from "./schemas";

export type {
  BillingDocument,
  BillingDocumentWithCycle,
  AdminBillingDocument,
} from "./domain/BillingDocument";
export type { DocumentItem } from "./domain/DocumentItem";
export type { BillingDocumentType } from "./domain/DocumentType";
export { DOCUMENT_TYPE_LABELS } from "./domain/DocumentType";
export type { BillingCycleInfo } from "./application/ports/BillingCycleProvider";
