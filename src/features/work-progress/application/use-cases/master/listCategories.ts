import type { WorkProgressMasterRepository } from "../../ports/WorkProgressMasterRepository";

export function listCategoriesUseCase(masterRepo: WorkProgressMasterRepository) {
  return async (options: { onlyActive?: boolean } = {}) => {
    return masterRepo.listCategories({ onlyActive: options.onlyActive ?? true });
  };
}
