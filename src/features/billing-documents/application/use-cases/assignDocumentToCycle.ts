import type { BillingDocumentRepository } from '../ports/BillingDocumentRepository'
import { BadRequestError, NotFoundError } from '@/lib/errors'

interface AssignDocumentToCycleDeps {
  repo: BillingDocumentRepository
}

// ผูก/ถอดเอกสารกับงวด (billing cycle) — ส่ง billingCycleId = null เพื่อถอดออกจากงวด
// ไม่ตรวจยอดเงินที่นี่: warning เรื่องยอดไม่ตรงเป็นแบบ advisory ฝั่ง UI
export function assignDocumentToCycleUseCase(deps: AssignDocumentToCycleDeps) {
  return async (documentId: string, customerId: string, billingCycleId: string | null) => {
    const doc = await deps.repo.getDocument(documentId)
    if (!doc) throw new NotFoundError('ไม่พบเอกสาร')

    if (billingCycleId) {
      const belongs = await deps.repo.cycleBelongsToCustomer(billingCycleId, customerId)
      if (!belongs) throw new BadRequestError('งวดไม่ตรงกับลูกค้ารายนี้')
    }

    return deps.repo.setDocumentCycle(documentId, billingCycleId)
  }
}
