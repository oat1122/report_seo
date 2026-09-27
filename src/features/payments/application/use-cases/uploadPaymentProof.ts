import { NotFoundError } from '@/lib/errors'
import type { PaymentRepository } from '../ports/PaymentRepository'
import type { PaymentImageStorage } from '../ports/PaymentImageStorage'

export function uploadPaymentProofUseCase(repo: PaymentRepository, storage: PaymentImageStorage) {
  return async (file: File, customerInternalId: string, billingCycleId?: string) => {
    // เช็คก่อนเขียนไฟล์: cycle ต้องเป็นของลูกค้าคนนี้ ไม่งั้นแนบสลิปเข้ารอบของคนอื่นได้
    const cycle = billingCycleId
      ? await repo.findCycleForCustomer(billingCycleId, customerInternalId)
      : null
    if (billingCycleId && !cycle) throw new NotFoundError('ไม่พบรอบจ่ายเงิน')

    const saved = await storage.validateAndWrite(file)
    let proof
    try {
      proof = await repo.createProof(customerInternalId, saved.url, billingCycleId)
    } catch (error) {
      // ลบไฟล์เฉพาะตอนสร้าง row ไม่สำเร็จ — ถ้าลบหลังจากนี้ row จะชี้ไปไฟล์ที่ไม่มีอยู่
      await storage.removeByAbsolutePath(saved.absolutePath)
      throw error
    }

    if (cycle && (cycle.status === 'PENDING' || cycle.status === 'OVERDUE')) {
      await repo.updateCycle(cycle.id, { status: 'REVIEWING' })
    }

    return proof
  }
}
