import type { RenderData } from './render-data'
import type { BillingDocumentRepository } from '../ports/BillingDocumentRepository'
import type { PdfRenderer } from '../ports/PdfRenderer'
import type { CompanySettings } from '@/features/company-settings/domain/CompanySettings'
import { BadRequestError, NotFoundError } from '@/lib/errors'
import { sanitizeFilename } from '@/infrastructure/upload/validators'

interface CycleInvoiceDeps {
  repo: Pick<
    BillingDocumentRepository,
    'getCycleInvoiceData' | 'getCustomerForDocument' | 'cycleHasInvoiceDocument'
  >
  renderer: PdfRenderer
  getCompanySettings: () => Promise<CompanySettings | null>
  renderDocumentHtml: (data: RenderData) => string
}

interface GenerateCycleInvoiceInput {
  customerId: string
  cycleId: string
  includeVat: boolean
}

// ออกใบแจ้งหนี้ของงวดแบบ on-the-fly เพื่อให้ลูกค้าดาวน์โหลด — ไม่บันทึกลง DB
export function generateCycleInvoicePdfUseCase(deps: CycleInvoiceDeps) {
  return async ({ customerId, cycleId, includeVat }: GenerateCycleInvoiceInput) => {
    const company = await deps.getCompanySettings()
    if (!company) {
      throw new BadRequestError('กรุณาตั้งค่าข้อมูลบริษัทก่อนออกใบแจ้งหนี้')
    }

    const cycle = await deps.repo.getCycleInvoiceData(cycleId, customerId)
    if (!cycle) {
      throw new NotFoundError('ไม่พบงวดการชำระเงินนี้')
    }

    // โหลดได้เฉพาะงวดที่มีใบแจ้งหนี้ที่แอดมินเตรียมไว้แล้วเท่านั้น
    const hasInvoice = await deps.repo.cycleHasInvoiceDocument(cycleId, customerId)
    if (!hasInvoice) {
      throw new NotFoundError('ยังไม่มีใบแจ้งหนี้สำหรับงวดนี้')
    }

    const customer = await deps.repo.getCustomerForDocument(customerId)
    if (!customer) {
      throw new NotFoundError('ไม่พบข้อมูลลูกค้า')
    }

    const year = cycle.dueDate.getFullYear()
    const documentNumber = `INV-${year}-${String(cycle.cycleNumber).padStart(4, '0')}`

    const renderData: RenderData = {
      type: 'INVOICE',
      documentNumber,
      company,
      customer: {
        name: customer.name,
        address: customer.address,
        taxId: customer.taxId,
        contactName: customer.contactName,
        phone: customer.phone,
        email: customer.email,
      },
      items: [
        {
          description: `${cycle.planDescription} (งวดที่ ${cycle.cycleNumber})`,
          quantity: 1,
          unit: 'งวด',
          unitPrice: cycle.amount,
        },
      ],
      note: null,
      dueDate: cycle.dueDate.toISOString(),
      paidDate: null,
      includeVat,
      generatedAt: new Date(),
    }

    const html = deps.renderDocumentHtml(renderData)
    const buffer = await deps.renderer.renderToPdf(html)
    const filename = sanitizeFilename(`${documentNumber}.pdf`)

    return { buffer, filename }
  }
}
