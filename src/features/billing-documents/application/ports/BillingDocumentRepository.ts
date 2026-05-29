import type {
  BillingDocument,
  AdminBillingDocument,
  BillingDocumentWithCycle,
  DocumentLineItem,
} from '../../domain/BillingDocument'
import type { BillingDocumentType } from '../../domain/DocumentType'

export interface CreateDocumentInput {
  customerId: string | null
  customerName?: string | null
  documentNumber: string
  type: BillingDocumentType
  pdfUrl: string
  totalAmount: number
  items: DocumentLineItem[]
  note?: string | null
  billingCycleId?: string | null
}

export interface UpdateDocumentInput {
  type: BillingDocumentType
  pdfUrl: string
  totalAmount: number
  items: DocumentLineItem[]
  note?: string | null
}

export interface AllDocumentsFilter {
  search?: string
  type?: BillingDocumentType
  customerId?: string
}

export interface CustomerForDocument {
  id: string
  name: string
  domain: string
  address: string | null
  taxId: string | null
  contactName: string | null
}

export interface BillingDocumentRepository {
  createDocument(input: CreateDocumentInput): Promise<BillingDocument>
  listDocuments(customerId: string, type?: BillingDocumentType): Promise<BillingDocument[]>
  getDocument(documentId: string): Promise<BillingDocument | null>
  deleteDocument(documentId: string): Promise<void>

  getCustomerForDocument(customerId: string): Promise<CustomerForDocument | null>

  getNextDocumentNumber(type: BillingDocumentType, year: number): Promise<string>

  updateDocument(documentId: string, input: UpdateDocumentInput): Promise<BillingDocument>

  listAllDocuments(filters?: AllDocumentsFilter): Promise<AdminBillingDocument[]>

  listDocumentsByCycleIds(cycleIds: string[]): Promise<BillingDocumentWithCycle[]>

  searchCustomers(query: string): Promise<CustomerForDocument[]>
}
