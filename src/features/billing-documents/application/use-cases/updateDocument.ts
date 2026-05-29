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
      items: Array<{
        description: string
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

    const customer = await deps.repo.getCustomerForDocument(input.customerId)
    if (!customer) throw new BadRequestError('ไม่พบข้อมูลลูกค้า')

    const totalAmount = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

    const html = deps.renderDocumentHtml({
      type: input.type,
      documentNumber: existingDoc.documentNumber,
      company,
      customer: {
        name: customer.name,
        address: customer.address,
        taxId: customer.taxId,
        contactName: customer.contactName,
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
      note: input.note ?? null,
    })
  }
}
