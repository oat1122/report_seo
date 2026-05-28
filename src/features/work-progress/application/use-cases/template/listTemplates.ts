import type { WorkProgressTemplateRepository } from '../../ports/WorkProgressTemplateRepository'

export function listTemplatesUseCase(templateRepo: WorkProgressTemplateRepository) {
  return (options: { includeInactive?: boolean } = {}) =>
    templateRepo.list({ includeInactive: options.includeInactive ?? false })
}
