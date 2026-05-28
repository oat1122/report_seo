import type { WorkProgressMasterRepository } from '../../ports/WorkProgressMasterRepository'

export function listStatusesUseCase(masterRepo: WorkProgressMasterRepository) {
  return async (options: { onlyActive?: boolean } = {}) => {
    return masterRepo.listStatuses({ onlyActive: options.onlyActive ?? true })
  }
}
