import { NotFoundError } from '@/lib/errors'
import type { WorkProgressTemplateRepository } from '../../ports/WorkProgressTemplateRepository'

export function getTemplateUseCase(templateRepo: WorkProgressTemplateRepository) {
  return async (id: string) => {
    const template = await templateRepo.findById(id)
    if (!template) throw new NotFoundError('ไม่พบ template')
    return template
  }
}
