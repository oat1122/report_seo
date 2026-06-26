import { NotFoundError } from '@/lib/errors'
import type { PaymentRepository } from '../../ports/PaymentRepository'
import type { ContractFileStorage } from '../../ports/ContractFileStorage'
import { resolveUploadPath } from '@/lib/upload-paths'

export function deleteContractFileUseCase(repo: PaymentRepository, storage: ContractFileStorage) {
  return async (contractFileId: string, customerId: string) => {
    const file = await repo.findContractFileById(contractFileId)
    // ผูก contract กับ customer ของ path — กันลบไฟล์ข้าม customer ผ่าน id ที่เดา/ส่งมั่ว
    // mismatch → NotFound (ไม่ใช่ Forbidden) เพื่อไม่ leak ว่า contractId นี้มีอยู่จริง
    if (!file || file.customerId !== customerId) throw new NotFoundError('ไม่พบไฟล์สัญญา')

    await repo.deleteContractFile(contractFileId)

    const absolutePath = resolveUploadPath(file.fileUrl, 'contracts')
    await storage.removeByAbsolutePath(absolutePath)
  }
}
