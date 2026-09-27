import { BadRequestError, ConflictError, NotFoundError } from '@/lib/errors'
import { assertCanDeactivate } from './deactivateMasterRow'
import { updateStatusSchema, upsertStatusSchema } from '../../../schemas'
import type { WorkProgressMasterRepository } from '../../ports/WorkProgressMasterRepository'

export function createStatusUseCase(masterRepo: WorkProgressMasterRepository) {
  return async (raw: unknown) => {
    const parsed = upsertStatusSchema.safeParse(raw)
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join(', ')
      throw new BadRequestError(`Invalid status data: ${detail}`)
    }
    const input = parsed.data
    // ถ้า isDefault=true → adapter จะ unset row อื่นใน $transaction ภายใน
    return masterRepo.createStatus({
      code: input.code,
      name: input.name,
      color: input.color ?? null,
      orderIndex: input.orderIndex,
      isTerminal: input.isTerminal,
      isDefault: input.isDefault,
      isActive: input.isActive,
    })
  }
}

export function updateStatusUseCase(masterRepo: WorkProgressMasterRepository) {
  return async (id: string, raw: unknown) => {
    const parsed = updateStatusSchema.safeParse(raw)
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join(', ')
      throw new BadRequestError(`Invalid update data: ${detail}`)
    }
    const existing = await masterRepo.findStatusById(id)
    if (!existing) throw new NotFoundError('ไม่พบสถานะ')
    // ห้ามทำให้ระบบไม่มีสถานะเริ่มต้น — สร้าง/clone แผนทุกลูกค้าจะพัง (findDefaultStatus = null)
    if (existing.isDefault && (parsed.data.isDefault === false || parsed.data.isActive === false)) {
      throw new ConflictError('ตั้งสถานะอื่นเป็นค่าเริ่มต้นก่อน แล้วค่อยแก้สถานะนี้')
    }
    if (existing.isActive && parsed.data.isActive === false) {
      await assertCanDeactivate(masterRepo, 'status', existing)
    }
    return masterRepo.updateStatus(id, parsed.data)
  }
}
