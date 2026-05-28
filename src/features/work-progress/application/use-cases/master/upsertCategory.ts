import { BadRequestError, NotFoundError } from '@/lib/errors'
import { updateCategorySchema, upsertCategorySchema } from '../../../schemas'
import type { WorkProgressMasterRepository } from '../../ports/WorkProgressMasterRepository'

export function createCategoryUseCase(masterRepo: WorkProgressMasterRepository) {
  return async (raw: unknown) => {
    const parsed = upsertCategorySchema.safeParse(raw)
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join(', ')
      throw new BadRequestError(`Invalid category data: ${detail}`)
    }
    const input = parsed.data
    return masterRepo.createCategory({
      code: input.code,
      name: input.name,
      description: input.description ?? null,
      color: input.color ?? null,
      icon: input.icon ?? null,
      orderIndex: input.orderIndex,
      isActive: input.isActive,
    })
  }
}

export function updateCategoryUseCase(masterRepo: WorkProgressMasterRepository) {
  return async (id: string, raw: unknown) => {
    const parsed = updateCategorySchema.safeParse(raw)
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join(', ')
      throw new BadRequestError(`Invalid update data: ${detail}`)
    }
    const existing = await masterRepo.findCategoryById(id)
    if (!existing) throw new NotFoundError('ไม่พบหมวดหมู่')
    return masterRepo.updateCategory(id, parsed.data)
  }
}
