import type { BillingDocumentRepository } from '../ports/BillingDocumentRepository'

export function getDocumentUseCase(repo: BillingDocumentRepository) {
  // null ถ้าเอกสารไม่ใช่ของลูกค้านี้ — route แปลงเป็น 404 (กัน IDOR ข้ามลูกค้า)
  return async (documentId: string, customerId: string) => {
    const doc = await repo.getDocument(documentId)
    return doc?.customerId === customerId ? doc : null
  }
}
