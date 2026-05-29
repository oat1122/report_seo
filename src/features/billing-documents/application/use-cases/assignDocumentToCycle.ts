import type { DocumentGenerationDeps } from './render-data'
import { BadRequestError, NotFoundError } from '@/lib/errors'
import { sanitizeFilename } from '@/infrastructure/upload/validators'

// ผูก/ถอดเอกสารกับงวด (billing cycle)
// - billingCycleId = null → ถอดเอกสารออกจากงวด (คง PDF/วันครบกำหนดเดิมไว้)
// - ผูกเข้างวด → sync วันครบกำหนดของเอกสารให้ตรงกับงวด และ render PDF ใหม่ตามวันนั้น
//   (เฉพาะเอกสารที่มีรายการ — เอกสารที่อัปโหลดเป็นไฟล์จะไม่ re-render เพราะไม่มีรายการให้สร้าง)
// หมายเหตุ: ไม่ตรวจยอดเงิน — warning ยอดไม่ตรงเป็น advisory ฝั่ง UI
export function assignDocumentToCycleUseCase(deps: DocumentGenerationDeps) {
  return async (documentId: string, customerId: string, billingCycleId: string | null) => {
    const doc = await deps.repo.getDocument(documentId)
    if (!doc) throw new NotFoundError('ไม่พบเอกสาร')

    if (!billingCycleId) {
      return deps.repo.setDocumentCycle(documentId, null)
    }

    const cycle = await deps.repo.getCycleForCustomer(billingCycleId, customerId)
    if (!cycle) throw new BadRequestError('งวดไม่ตรงกับลูกค้ารายนี้')

    const items = doc.items ?? []
    let pdfUrl = doc.pdfUrl

    if (items.length > 0) {
      const company = await deps.getCompanySettings()
      if (!company) throw new BadRequestError('กรุณาตั้งค่าข้อมูลบริษัทก่อน')

      const dbCustomer = await deps.repo.getCustomerForDocument(customerId)
      if (!dbCustomer) throw new BadRequestError('ไม่พบข้อมูลลูกค้า')

      const html = deps.renderDocumentHtml({
        type: doc.type,
        documentNumber: doc.documentNumber,
        company,
        customer: {
          name: doc.customerName ?? dbCustomer.name,
          address: dbCustomer.address,
          taxId: dbCustomer.taxId,
          contactName: dbCustomer.contactName,
          phone: dbCustomer.phone,
          email: dbCustomer.email,
        },
        items,
        note: doc.note,
        dueDate: cycle.dueDate.toISOString(),
        paidDate: doc.paidDate ? doc.paidDate.toISOString() : null,
        generatedAt: doc.generatedAt,
        includeVat: doc.includeVat,
      })

      const pdfBuffer = await deps.renderer.renderToPdf(html)
      await deps.storage.deletePdf(doc.pdfUrl)
      pdfUrl = await deps.storage.savePdf(pdfBuffer, sanitizeFilename(`${doc.documentNumber}.pdf`))
    }

    return deps.repo.updateDocument(documentId, {
      type: doc.type,
      pdfUrl,
      totalAmount: doc.totalAmount,
      items,
      includeVat: doc.includeVat,
      note: doc.note,
      dueDate: cycle.dueDate,
      paidDate: doc.paidDate,
      customerName: doc.customerName,
      billingCycleId,
    })
  }
}
