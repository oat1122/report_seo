import { BadRequestError, ConflictError, NotFoundError } from '@/lib/errors'
import { updateTemplateSchema, upsertTemplateSchema } from '../../../schemas'
import type { WorkProgressMasterRepository } from '../../ports/WorkProgressMasterRepository'
import type {
  CreateTemplateItemData,
  WorkProgressTemplateRepository,
} from '../../ports/WorkProgressTemplateRepository'

export function createTemplateUseCase(
  templateRepo: WorkProgressTemplateRepository,
  masterRepo: WorkProgressMasterRepository,
) {
  return async (createdById: string | null, raw: unknown) => {
    const parsed = upsertTemplateSchema.safeParse(raw)
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join(', ')
      throw new BadRequestError(`Invalid template data: ${detail}`)
    }
    const input = parsed.data

    const items: CreateTemplateItemData[] = []
    if (input.items && input.items.length > 0) {
      for (let i = 0; i < input.items.length; i++) {
        const it = input.items[i]
        const category = await masterRepo.findCategoryById(it.categoryId)
        if (!category || !category.isActive) {
          throw new BadRequestError(`items[${i}]: หมวดหมู่ไม่ถูกต้องหรือถูกปิดใช้งาน`)
        }
        items.push({
          categoryId: it.categoryId,
          activity: it.activity,
          description: it.description ?? null,
          duration: it.duration ?? null,
          weight: it.weight ?? 1,
          orderIndex: it.orderIndex ?? i,
          defaultPeriods: it.defaultPeriods ?? null,
          subtasks: it.subtasks,
        })
      }
    }

    return templateRepo.create(
      {
        name: input.name,
        description: input.description ?? null,
        periodType: input.periodType,
        durationMonths: input.durationMonths,
        isActive: input.isActive,
        createdById,
      },
      items,
    )
  }
}

export function updateTemplateUseCase(templateRepo: WorkProgressTemplateRepository) {
  return async (id: string, raw: unknown) => {
    const parsed = updateTemplateSchema.safeParse(raw)
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join(', ')
      throw new BadRequestError(`Invalid update data: ${detail}`)
    }
    const existing = await templateRepo.findById(id)
    if (!existing) throw new NotFoundError('ไม่พบ template')
    if (existing.isSystem) {
      throw new ConflictError('ห้ามแก้ system template')
    }
    return templateRepo.update(id, parsed.data)
  }
}
