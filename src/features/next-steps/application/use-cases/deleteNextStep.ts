import type { NextStepRepository } from '../ports/NextStepRepository'

export function deleteNextStepUseCase(repo: NextStepRepository) {
  return (customerInternalId: string, stepId: string) => repo.delete(stepId, customerInternalId)
}
