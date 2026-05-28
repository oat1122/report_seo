import { BadRequestError, ConflictError, NotFoundError } from '@/lib/errors'
import type { MasterKind } from '../../../domain/WorkProgressMaster'
import type { WorkProgressMasterRepository } from '../../ports/WorkProgressMasterRepository'

export function deactivateMasterRowUseCase(masterRepo: WorkProgressMasterRepository) {
  return async (kind: MasterKind, id: string) => {
    let existing
    switch (kind) {
      case 'category':
        existing = await masterRepo.findCategoryById(id)
        break
      case 'status':
        existing = await masterRepo.findStatusById(id)
        break
      case 'markType':
        existing = await masterRepo.findMarkTypeById(id)
        break
      default:
        throw new BadRequestError(`Invalid master kind: ${kind}`)
    }
    if (!existing) throw new NotFoundError('ไม่พบข้อมูล master')
    if (existing.isSystem) {
      throw new ConflictError('ไม่สามารถปิดใช้งาน system row ได้')
    }
    const refCount = await masterRepo.countReferences(kind, id)
    if (refCount > 0) {
      throw new ConflictError(`ไม่สามารถปิดใช้งานได้ — มีข้อมูล ${refCount} รายการอ้างอิงอยู่`)
    }
    await masterRepo.deactivate(kind, id)
  }
}
