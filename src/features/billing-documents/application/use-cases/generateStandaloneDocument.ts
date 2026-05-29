import type { DocumentGenerationDeps, RenderData } from './render-data'
import type { BillingDocumentType } from '../../domain/DocumentType'
import { computeVatBreakdown } from '../../domain/vat'
import { BadRequestError } from '@/lib/errors'
import { sanitizeFilename } from '@/infrastructure/upload/validators'

interface StandaloneInput {
  customerId?: string | null
  customer: {
    name: string
    address?: string | null
    taxId?: string | null
    contactName?: string | null
    phone?: string | null
  }
  type: BillingDocumentType
  items: Array<{
    description: string
    detail?: string
    quantity: number
    unit: string
    unitPrice: number
  }>
  note?: string | null
  dueDate?: string | null
  paidDate?: string | null
  includeVat?: boolean
}

export function generateStandaloneDocumentUseCase(deps: DocumentGenerationDeps) {
  return async (input: StandaloneInput) => {
    if (input.items.length === 0) {
      throw new BadRequestError('ต้องมีอย่างน้อย 1 รายการ')
    }

    const company = await deps.getCompanySettings()
    if (!company) {
      throw new BadRequestError('กรุณาตั้งค่าข้อมูลบริษัทก่อนสร้างเอกสาร')
    }

    const year = new Date().getFullYear()
    const documentNumber = await deps.repo.getNextDocumentNumber(input.type, year)

    // VAT ใช้เฉพาะ INVOICE — กัน flag ค้างจากเอกสารชนิดอื่นไม่ให้ติดยอด
    const applyVat = input.type === 'INVOICE' && !!input.includeVat
    const subtotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const totalAmount = applyVat ? computeVatBreakdown(subtotal).grandTotal : subtotal

    // email บนเอกสารดึงจากบัญชี User ของลูกค้า (read-only) — เฉพาะกรณีเลือกลูกค้าจากระบบ
    const dbCustomer = input.customerId
      ? await deps.repo.getCustomerForDocument(input.customerId)
      : null

    const now = new Date()
    const renderData: RenderData = {
      type: input.type,
      documentNumber,
      company,
      customer: {
        name: input.customer.name,
        address: input.customer.address ?? null,
        taxId: input.customer.taxId ?? null,
        contactName: input.customer.contactName ?? null,
        phone: input.customer.phone ?? null,
        email: dbCustomer?.email ?? null,
      },
      items: input.items.map((i) => ({
        description: i.description,
        detail: i.detail,
        quantity: i.quantity,
        unit: i.unit,
        unitPrice: i.unitPrice,
      })),
      note: input.note ?? null,
      dueDate: input.dueDate ?? null,
      paidDate: input.paidDate ?? null,
      generatedAt: now,
      includeVat: applyVat,
    }

    const html = deps.renderDocumentHtml(renderData)
    const pdfBuffer = await deps.renderer.renderToPdf(html)
    const filename = sanitizeFilename(`${documentNumber}.pdf`)
    const pdfUrl = await deps.storage.savePdf(pdfBuffer, filename)

    return deps.repo.createDocument({
      customerId: input.customerId ?? null,
      customerName: input.customer.name,
      documentNumber,
      type: input.type,
      pdfUrl,
      totalAmount,
      items: input.items,
      includeVat: applyVat,
      note: input.note ?? null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      paidDate: input.paidDate ? new Date(input.paidDate) : null,
      billingCycleId: null,
    })
  }
}
