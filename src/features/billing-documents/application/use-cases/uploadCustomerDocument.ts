import type { BillingDocumentRepository } from '../ports/BillingDocumentRepository'
import type { DocumentStorage } from '../ports/DocumentStorage'
import type { BillingDocumentType } from '../../domain/DocumentType'
import { BadRequestError } from '@/lib/errors'

interface UploadCustomerDocumentDeps {
  repo: BillingDocumentRepository
  storage: DocumentStorage
}

export function uploadCustomerDocumentUseCase(deps: UploadCustomerDocumentDeps) {
  return async (
    file: File,
    customerId: string,
    type: BillingDocumentType,
    billingCycleId: string | null = null,
  ) => {
    const customer = await deps.repo.getCustomerForDocument(customerId)
    if (!customer) throw new BadRequestError('ไม่พบข้อมูลลูกค้า')

    if (billingCycleId) {
      const cycle = await deps.repo.getCycleForCustomer(billingCycleId, customerId)
      if (!cycle) throw new BadRequestError('งวดไม่ตรงกับลูกค้ารายนี้')
    }

    const saved = await deps.storage.saveUpload(file)
    try {
      const year = new Date().getFullYear()
      const documentNumber = await deps.repo.getNextDocumentNumber(type, year)

      return await deps.repo.createDocument({
        customerId,
        customerName: customer.name,
        documentNumber,
        type,
        pdfUrl: saved.url,
        totalAmount: 0,
        items: [],
        note: null,
        billingCycleId,
      })
    } catch (error) {
      await deps.storage.deletePdf(saved.url)
      throw error
    }
  }
}
