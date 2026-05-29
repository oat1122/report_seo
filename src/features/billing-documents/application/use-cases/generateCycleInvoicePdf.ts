import type { RenderData } from './render-data'
import type { BillingDocumentRepository } from '../ports/BillingDocumentRepository'
import type { PdfRenderer } from '../ports/PdfRenderer'
import type { CompanySettings } from '@/features/company-settings/domain/CompanySettings'
import { BadRequestError, NotFoundError } from '@/lib/errors'
import { sanitizeFilename } from '@/infrastructure/upload/validators'

interface CycleInvoiceDeps {
  repo: Pick<BillingDocumentRepository, 'getCycleInvoiceDocument' | 'getCustomerForDocument'>
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
// re-render จากใบแจ้งหนี้ที่แอดมินผูกกับงวด (items + note จริง) เพื่อให้ตรงกับที่แอดมินเตรียมไว้
// แต่ honor ตัวเลือก VAT ของลูกค้า (รวม/ไม่รวม) ตอน render
export function generateCycleInvoicePdfUseCase(deps: CycleInvoiceDeps) {
  return async ({ customerId, cycleId, includeVat }: GenerateCycleInvoiceInput) => {
    const company = await deps.getCompanySettings()
    if (!company) {
      throw new BadRequestError('กรุณาตั้งค่าข้อมูลบริษัทก่อนออกใบแจ้งหนี้')
    }

    const doc = await deps.repo.getCycleInvoiceDocument(cycleId, customerId)
    // เอกสารที่อัปโหลดเป็นไฟล์ (ไม่มีรายการ) re-render ใหม่ไม่ได้ — ถือว่ายังไม่มีใบแจ้งหนี้ให้ดาวน์โหลด
    if (!doc || !doc.items || doc.items.length === 0) {
      throw new NotFoundError('ยังไม่มีใบแจ้งหนี้สำหรับงวดนี้')
    }

    const customer = await deps.repo.getCustomerForDocument(customerId)
    if (!customer) {
      throw new NotFoundError('ไม่พบข้อมูลลูกค้า')
    }

    const renderData: RenderData = {
      type: 'INVOICE',
      documentNumber: doc.documentNumber,
      company,
      customer: {
        name: doc.customerName ?? customer.name,
        address: customer.address,
        taxId: customer.taxId,
        contactName: customer.contactName,
        phone: customer.phone,
        email: customer.email,
      },
      items: doc.items,
      note: doc.note,
      dueDate: doc.dueDate ? doc.dueDate.toISOString() : null,
      paidDate: doc.paidDate ? doc.paidDate.toISOString() : null,
      includeVat,
      generatedAt: doc.generatedAt,
    }

    const html = deps.renderDocumentHtml(renderData)
    const buffer = await deps.renderer.renderToPdf(html)
    const filename = sanitizeFilename(`${doc.documentNumber}.pdf`)

    return { buffer, filename }
  }
}
