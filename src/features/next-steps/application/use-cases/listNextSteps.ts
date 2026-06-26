import type { NextStepRepository } from '../ports/NextStepRepository'

export function listNextStepsUseCase(repo: NextStepRepository) {
  return (customerInternalId: string) => repo.findByCustomerId(customerInternalId)
}
