import type { WorkProgressMasterRepository } from "../../ports/WorkProgressMasterRepository";

export function listMarkTypesUseCase(masterRepo: WorkProgressMasterRepository) {
  return async (options: { onlyActive?: boolean } = {}) => {
    return masterRepo.listMarkTypes({ onlyActive: options.onlyActive ?? true });
  };
}
