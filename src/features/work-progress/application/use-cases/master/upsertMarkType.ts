import { BadRequestError, NotFoundError } from '@/lib/errors'
import { updateMarkTypeSchema, upsertMarkTypeSchema } from '../../../schemas'
import type { WorkProgressMasterRepository } from '../../ports/WorkProgressMasterRepository'

export function createMarkTypeUseCase(masterRepo: WorkProgressMasterRepository) {
  return async (raw: unknown) => {
    const parsed = upsertMarkTypeSchema.safeParse(raw)
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join(', ')
      throw new BadRequestError(`Invalid mark type data: ${detail}`)
    }
    const input = parsed.data
    return masterRepo.createMarkType({
      code: input.code,
      name: input.name,
      color: input.color ?? null,
      icon: input.icon ?? null,
      orderIndex: input.orderIndex,
      isActive: input.isActive,
    })
  }
}

export function updateMarkTypeUseCase(masterRepo: WorkProgressMasterRepository) {
  return async (id: string, raw: unknown) => {
    const parsed = updateMarkTypeSchema.safeParse(raw)
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join(', ')
      throw new BadRequestError(`Invalid update data: ${detail}`)
    }
    const existing = await masterRepo.findMarkTypeById(id)
    if (!existing) throw new NotFoundError('ไม่พบประเภทเครื่องหมาย')
    return masterRepo.updateMarkType(id, parsed.data)
  }
}
