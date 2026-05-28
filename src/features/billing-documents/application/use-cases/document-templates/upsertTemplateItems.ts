import type {
  DocumentTemplateRepository,
  TemplateItemInput,
} from '../../ports/DocumentTemplateRepository'
import { NotFoundError } from '@/lib/errors'

export function upsertTemplateItemsUseCase(repo: DocumentTemplateRepository) {
  return async (templateId: string, items: TemplateItemInput[]) => {
    const existing = await repo.findById(templateId)
    if (!existing) throw new NotFoundError('ไม่พบ template')
    return repo.upsertItems(templateId, items)
  }
}
