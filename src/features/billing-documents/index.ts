import { PrismaBillingDocumentRepository } from './infrastructure/PrismaBillingDocumentRepository'
import { LocalDocumentStorage } from './infrastructure/LocalDocumentStorage'
import { PuppeteerPdfRenderer } from './infrastructure/PuppeteerPdfRenderer'
import { renderDocumentHtml } from './infrastructure/templates/render-document'
import { getCompanySettings } from '@/features/company-settings'

import { generateStandaloneDocumentUseCase } from './application/use-cases/generateStandaloneDocument'
import { uploadCustomerDocumentUseCase } from './application/use-cases/uploadCustomerDocument'
import { listDocumentsUseCase } from './application/use-cases/listDocuments'
import { getDocumentUseCase } from './application/use-cases/getDocument'
import { deleteDocumentUseCase } from './application/use-cases/deleteDocument'
import { updateDocumentUseCase } from './application/use-cases/updateDocument'
import { listAllDocumentsUseCase } from './application/use-cases/listAllDocuments'

const repo = new PrismaBillingDocumentRepository()
const storage = new LocalDocumentStorage()
const renderer = new PuppeteerPdfRenderer()

const commonDeps = {
  repo,
  storage,
  renderer,
  getCompanySettings,
  renderDocumentHtml,
}

// Documents
export const generateStandaloneDocument = generateStandaloneDocumentUseCase(commonDeps)
export const uploadCustomerDocument = uploadCustomerDocumentUseCase({ repo, storage })
export const listDocuments = listDocumentsUseCase(repo)
export const getDocument = getDocumentUseCase(repo)
export const deleteDocument = deleteDocumentUseCase(repo, storage)
export const updateDocument = updateDocumentUseCase(commonDeps)
export const listAllDocuments = listAllDocumentsUseCase(repo)

export async function searchCustomers(query: string) {
  return repo.searchCustomers(query)
}

export async function getCustomerForDocument(customerId: string) {
  return repo.getCustomerForDocument(customerId)
}

// Schemas
export {
  updateDocumentSchema,
  updateDocumentItemSchema,
  listAllDocumentsQuerySchema,
  generateStandaloneDocumentSchema,
  uploadDocumentSchema,
  searchCustomersQuerySchema,
} from './schemas'
export type {
  UpdateDocumentInput,
  UpdateDocumentItemInput,
  ListAllDocumentsQuery,
  GenerateStandaloneDocumentInput,
  UploadDocumentInput,
  SearchCustomersQuery,
} from './schemas'

// Domain types
export type {
  BillingDocument,
  BillingDocumentWithCycle,
  AdminBillingDocument,
  DocumentLineItem,
} from './domain/BillingDocument'
export type { BillingDocumentType } from './domain/DocumentType'
export { DOCUMENT_TYPE_LABELS } from './domain/DocumentType'
export type { CustomerForDocument } from './application/ports/BillingDocumentRepository'
