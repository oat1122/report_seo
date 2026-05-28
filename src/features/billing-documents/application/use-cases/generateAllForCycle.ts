import type { BillingDocumentRepository } from '../ports/BillingDocumentRepository'
import type { DocumentStorage } from '../ports/DocumentStorage'
import type { PdfRenderer } from '../ports/PdfRenderer'
import type { BillingCycleProvider } from '../ports/BillingCycleProvider'
import type { DocumentTemplateRepository } from '../ports/DocumentTemplateRepository'
import type { BillingDocumentType } from '../../domain/DocumentType'
import type { BillingDocument } from '../../domain/BillingDocument'
import type { CompanySettings } from '@/features/company-settings/domain/CompanySettings'
import type { RenderData } from './generateDocument'
import { BadRequestError } from '@/lib/errors'
import { sanitizeFilename } from '@/infrastructure/upload/validators'

const ALL_TYPES: BillingDocumentType[] = ['BILLING_NOTE', 'INVOICE', 'RECEIPT', 'TAX_INVOICE']

export interface GenerateAllForCycleDeps {
  repo: BillingDocumentRepository
  storage: DocumentStorage
  renderer: PdfRenderer
  cycleProvider: BillingCycleProvider
  templateRepo: DocumentTemplateRepository
  getCompanySettings: () => Promise<CompanySettings | null>
  renderDocumentHtml: (data: RenderData) => string
}

export function generateAllForCycleUseCase(deps: GenerateAllForCycleDeps) {
  return async (input: { customerId: string; billingCycleId: string; note?: string | null }) => {
    const cycle = await deps.cycleProvider.getCycleById(input.billingCycleId)
    if (!cycle) throw new BadRequestError('ไม่พบรอบจ่ายเงิน')
    if (cycle.planCustomerId !== input.customerId) {
      throw new BadRequestError('รอบจ่ายเงินไม่ตรงกับลูกค้า')
    }

    if (!cycle.planDocumentTemplateId) {
      throw new BadRequestError('แผนชำระเงินยังไม่ได้เลือก template เอกสาร')
    }

    const template = await deps.templateRepo.findById(cycle.planDocumentTemplateId)
    if (!template || template.items.length === 0) {
      throw new BadRequestError('Template ไม่มีรายการสินค้า/บริการ')
    }

    const company = await deps.getCompanySettings()
    if (!company) {
      throw new BadRequestError('กรุณาตั้งค่าข้อมูลบริษัทก่อนสร้างเอกสาร')
    }

    const customer = await deps.repo.getCustomerForDocument(input.customerId)
    if (!customer) throw new BadRequestError('ไม่พบข้อมูลลูกค้า')

    const items = template.items
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

    const year = new Date().getFullYear()
    const now = new Date()
    const dueDateStr = cycle.dueDate.toISOString().split('T')[0]
    const paidDateStr = cycle.paidDate ? cycle.paidDate.toISOString().split('T')[0] : null

    const results: BillingDocument[] = []

    for (const type of ALL_TYPES) {
      const documentNumber = await deps.repo.getNextDocumentNumber(type, year)

      const html = deps.renderDocumentHtml({
        type,
        documentNumber,
        company,
        customer: {
          name: customer.name,
          address: customer.address,
          taxId: customer.taxId,
          contactName: customer.contactName,
        },
        items: items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unit: i.unit,
          unitPrice: i.unitPrice,
        })),
        note: input.note ?? null,
        dueDate: type === 'RECEIPT' ? null : dueDateStr,
        paidDate: type === 'RECEIPT' ? paidDateStr : null,
        generatedAt: now,
      })

      const pdfBuffer = await deps.renderer.renderToPdf(html)
      const filename = sanitizeFilename(`${documentNumber}.pdf`)
      const pdfUrl = await deps.storage.savePdf(pdfBuffer, filename)

      const doc = await deps.repo.createDocument({
        customerId: input.customerId,
        customerName: customer.name,
        documentNumber,
        type,
        pdfUrl,
        totalAmount,
        note: input.note ?? null,
        billingCycleId: input.billingCycleId,
      })

      results.push(doc)
    }

    return results
  }
}
