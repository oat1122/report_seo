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
  dueDate?: Date | null
  paidDate?: Date | null
  billingCycleId?: string | null
}

export interface UpdateDocumentInput {
  type: BillingDocumentType
  pdfUrl: string
  totalAmount: number
  items: DocumentLineItem[]
  note?: string | null
  dueDate?: Date | null
  paidDate?: Date | null
  customerName?: string | null
  billingCycleId?: string | null
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
  phone: string | null
  email: string | null
}

export interface UpdateCustomerInfoInput {
  name: string
  address: string | null
  taxId: string | null
  contactName: string | null
  phone: string | null
}

export interface BillingDocumentRepository {
  createDocument(input: CreateDocumentInput): Promise<BillingDocument>
  listDocuments(customerId: string, type?: BillingDocumentType): Promise<BillingDocument[]>
  getDocument(documentId: string): Promise<BillingDocument | null>
  deleteDocument(documentId: string): Promise<void>

  getCustomerForDocument(customerId: string): Promise<CustomerForDocument | null>

  updateCustomerInfo(customerId: string, input: UpdateCustomerInfoInput): Promise<void>

  getNextDocumentNumber(type: BillingDocumentType, year: number): Promise<string>

  updateDocument(documentId: string, input: UpdateDocumentInput): Promise<BillingDocument>

  setDocumentCycle(documentId: string, billingCycleId: string | null): Promise<BillingDocument>

  // คืนงวดของลูกค้าราย customerId พร้อม dueDate (ใช้ validate + sync วันครบกำหนดลงเอกสาร)
  getCycleForCustomer(
    cycleId: string,
    customerId: string,
  ): Promise<{ id: string; dueDate: Date } | null>

  // คืนเอกสารใบแจ้งหนี้ (INVOICE) ที่ผูกกับงวดนี้ เพื่อให้ลูกค้าดาวน์โหลดใบเดียวกับที่แอดมินเตรียมไว้
  // (scoped ด้วย customerId ภายใน) — null ถ้ายังไม่มีใบแจ้งหนี้ผูกกับงวด
  getCycleInvoiceDocument(cycleId: string, customerId: string): Promise<BillingDocument | null>

  listAllDocuments(filters?: AllDocumentsFilter): Promise<AdminBillingDocument[]>

  listDocumentsByCycleIds(cycleIds: string[]): Promise<BillingDocumentWithCycle[]>

  searchCustomers(query: string): Promise<CustomerForDocument[]>
}
