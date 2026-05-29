import type { BillingDocumentRepository } from '../ports/BillingDocumentRepository'
import type { DocumentStorage } from '../ports/DocumentStorage'
import type { PdfRenderer } from '../ports/PdfRenderer'
import type { BillingDocumentType } from '../../domain/DocumentType'
import type { CompanySettings } from '@/features/company-settings/domain/CompanySettings'

export interface RenderData {
  type: BillingDocumentType
  documentNumber: string
  company: CompanySettings
  customer: {
    name: string
    address: string | null
    taxId: string | null
    contactName: string | null
    phone: string | null
    email: string | null
  }
  items: Array<{
    description: string
    quantity: number
    unit: string
    unitPrice: number
  }>
  note: string | null
  dueDate: string | null
  paidDate: string | null
  generatedAt: Date
}

export interface DocumentGenerationDeps {
  repo: BillingDocumentRepository
  storage: DocumentStorage
  renderer: PdfRenderer
  getCompanySettings: () => Promise<CompanySettings | null>
  renderDocumentHtml: (data: RenderData) => string
}
