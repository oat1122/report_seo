import { nextStepSchema, normalizeDescription } from '../../schemas'
import { BadRequestError } from '@/lib/errors'
import type { NextStepRepository } from '../ports/NextStepRepository'

export function updateNextStepUseCase(repo: NextStepRepository) {
  return async (customerInternalId: string, stepId: string, raw: unknown) => {
    const parsed = nextStepSchema.safeParse(raw)
    if (!parsed.success) {
      throw new BadRequestError(
        `Invalid data: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      )
    }
    return repo.update(stepId, customerInternalId, {
      title: parsed.data.title.trim(),
      priority: parsed.data.priority,
      description: normalizeDescription(parsed.data.description),
    })
  }
}
