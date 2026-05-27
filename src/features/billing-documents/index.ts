import { PrismaBillingDocumentRepository } from "./infrastructure/PrismaBillingDocumentRepository";
import { PrismaDocumentTemplateRepository } from "./infrastructure/PrismaDocumentTemplateRepository";
import { LocalDocumentStorage } from "./infrastructure/LocalDocumentStorage";
import { PuppeteerPdfRenderer } from "./infrastructure/PuppeteerPdfRenderer";
import { PrismaBillingCycleProvider } from "./infrastructure/PrismaBillingCycleProvider";
import { renderDocumentHtml } from "./infrastructure/templates/render-document";
import { getCompanySettings } from "@/features/company-settings";

import { generateDocumentUseCase } from "./application/use-cases/generateDocument";
import { listDocumentsUseCase } from "./application/use-cases/listDocuments";
import { getDocumentUseCase } from "./application/use-cases/getDocument";
import { deleteDocumentUseCase } from "./application/use-cases/deleteDocument";
import { updateDocumentUseCase } from "./application/use-cases/updateDocument";
import { generateAllForCycleUseCase } from "./application/use-cases/generateAllForCycle";
import { listAllDocumentsUseCase } from "./application/use-cases/listAllDocuments";
import { listDocumentsByCyclesUseCase } from "./application/use-cases/listDocumentsByCycles";

import { listTemplatesUseCase } from "./application/use-cases/document-templates/listTemplates";
import { getTemplateUseCase } from "./application/use-cases/document-templates/getTemplate";
import { createTemplateUseCase } from "./application/use-cases/document-templates/createTemplate";
import { updateTemplateUseCase } from "./application/use-cases/document-templates/updateTemplate";
import { deleteTemplateUseCase } from "./application/use-cases/document-templates/deleteTemplate";
import { upsertTemplateItemsUseCase } from "./application/use-cases/document-templates/upsertTemplateItems";

const repo = new PrismaBillingDocumentRepository();
const templateRepo = new PrismaDocumentTemplateRepository();
const storage = new LocalDocumentStorage();
const renderer = new PuppeteerPdfRenderer();
const cycleProvider = new PrismaBillingCycleProvider();

const commonDeps = {
  repo,
  storage,
  renderer,
  cycleProvider,
  templateRepo,
  getCompanySettings,
  renderDocumentHtml,
};

// Document Templates
export const listDocumentTemplates = listTemplatesUseCase(templateRepo);
export const getDocumentTemplate = getTemplateUseCase(templateRepo);
export const createDocumentTemplate = createTemplateUseCase(templateRepo);
export const updateDocumentTemplate = updateTemplateUseCase(templateRepo);
export const deleteDocumentTemplate = deleteTemplateUseCase(templateRepo);
export const upsertDocumentTemplateItems =
  upsertTemplateItemsUseCase(templateRepo);

// Documents
export const generateDocument = generateDocumentUseCase(commonDeps);
export const listDocuments = listDocumentsUseCase(repo);
export const getDocument = getDocumentUseCase(repo);
export const deleteDocument = deleteDocumentUseCase(repo, storage);

export const updateDocument = updateDocumentUseCase(commonDeps);
export const generateAllForCycle = generateAllForCycleUseCase(commonDeps);
export const listAllDocuments = listAllDocumentsUseCase(repo);
export const listDocumentsByCycles = listDocumentsByCyclesUseCase(
  repo,
  cycleProvider,
);

// Schemas
export {
  generateDocumentSchema,
  updateDocumentSchema,
  updateDocumentItemSchema,
  generateAllForCycleSchema,
  listAllDocumentsQuerySchema,
  createDocumentTemplateSchema,
  updateDocumentTemplateSchema,
  upsertTemplateItemsSchema,
  documentTemplateItemSchema,
  listTemplatesQuerySchema,
} from "./schemas";
export type {
  GenerateDocumentInput,
  UpdateDocumentInput,
  UpdateDocumentItemInput,
  GenerateAllForCycleInput,
  ListAllDocumentsQuery,
  CreateDocumentTemplateInput,
  UpdateDocumentTemplateInput,
  UpsertTemplateItemsInput,
  DocumentTemplateItemInput,
  ListTemplatesQuery,
} from "./schemas";

// Domain types
export type {
  BillingDocument,
  BillingDocumentWithCycle,
  AdminBillingDocument,
} from "./domain/BillingDocument";
export type {
  DocumentTemplate,
  DocumentTemplateItem,
  DocumentTemplateDetail,
  DocumentTemplateScope,
} from "./domain/DocumentTemplate";
export type { BillingDocumentType } from "./domain/DocumentType";
export { DOCUMENT_TYPE_LABELS } from "./domain/DocumentType";
export type { BillingCycleInfo } from "./application/ports/BillingCycleProvider";
