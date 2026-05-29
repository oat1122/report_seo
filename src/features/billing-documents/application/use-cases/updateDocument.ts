import type { DocumentGenerationDeps } from './render-data'
import type { BillingDocumentType } from '../../domain/DocumentType'
import { BadRequestError, NotFoundError } from '@/lib/errors'
import { sanitizeFilename } from '@/infrastructure/upload/validators'

export function updateDocumentUseCase(deps: DocumentGenerationDeps) {
  return async (
    documentId: string,
    input: {
      customerId: string
      type: BillingDocumentType
      note?: string | null
      dueDate?: string | null
      paidDate?: string | null
      customer?: {
        name: string
        address?: string | null
        taxId?: string | null
        contactName?: string | null
        phone?: string | null
      } | null
      items: Array<{
        description: string
        detail?: string
        quantity: number
        unit: string
        unitPrice: number
      }>
    },
  ) => {
    const existingDoc = await deps.repo.getDocument(documentId)
    if (!existingDoc) throw new NotFoundError('ไม่พบเอกสาร')

    const company = await deps.getCompanySettings()
    if (!company) {
      throw new BadRequestError('กรุณาตั้งค่าข้อมูลบริษัทก่อนแก้ไขเอกสาร')
    }

    const dbCustomer = await deps.repo.getCustomerForDocument(input.customerId)
    if (!dbCustomer) throw new BadRequestError('ไม่พบข้อมูลลูกค้า')

    // ใช้ข้อมูลที่แก้บนเอกสาร (ถ้าส่งมา) มิฉะนั้น fallback เป็นข้อมูลใน DB
    // email ดึงจากบัญชี User เสมอ (read-only)
    const renderCustomer = input.customer ?? dbCustomer

    const totalAmount = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

    const html = deps.renderDocumentHtml({
      type: input.type,
      documentNumber: existingDoc.documentNumber,
      company,
      customer: {
        name: renderCustomer.name,
        address: renderCustomer.address ?? null,
        taxId: renderCustomer.taxId ?? null,
        contactName: renderCustomer.contactName ?? null,
        phone: renderCustomer.phone ?? null,
        email: dbCustomer.email,
      },
      items: input.items,
      note: input.note ?? null,
      dueDate: input.dueDate ?? null,
      paidDate: input.paidDate ?? null,
      generatedAt: existingDoc.generatedAt,
    })

    const pdfBuffer = await deps.renderer.renderToPdf(html)

    await deps.storage.deletePdf(existingDoc.pdfUrl)

    const filename = sanitizeFilename(`${existingDoc.documentNumber}.pdf`)
    const pdfUrl = await deps.storage.savePdf(pdfBuffer, filename)

    return deps.repo.updateDocument(documentId, {
      type: input.type,
      pdfUrl,
      totalAmount,
      items: input.items,
      note: input.note ?? null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      paidDate: input.paidDate ? new Date(input.paidDate) : null,
      customerName: renderCustomer.name,
    })
  }
}
