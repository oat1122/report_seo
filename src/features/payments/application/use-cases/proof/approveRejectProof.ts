import { BadRequestError, NotFoundError } from '@/lib/errors'
import type { PaymentRepository } from '../../ports/PaymentRepository'

export function approveRejectProofUseCase(repo: PaymentRepository) {
  return async (customerId: string, proofId: string, status: 'APPROVED' | 'REJECTED') => {
    const proof = await repo.findProofById(proofId)
    if (!proof || proof.customerId !== customerId) {
      throw new NotFoundError('ไม่พบหลักฐานการชำระเงิน')
    }
    // ตัดสินได้ครั้งเดียว — กัน REJECT หลัง APPROVE แล้ว cycle ค้าง PAID (หรือกลับกัน)
    // proof + cycle + plan เปลี่ยนใน transaction เดียว: พังกลางทาง = ไม่มีอะไรเปลี่ยน กดใหม่ได้
    const decided = proof.status === 'PENDING' ? await repo.decideProof(proofId, status) : null
    if (!decided) throw new BadRequestError('หลักฐานนี้ถูกตรวจสอบไปแล้ว')
    return decided
  }
}
