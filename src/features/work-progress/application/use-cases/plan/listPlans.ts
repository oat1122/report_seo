import { listPlansQuerySchema } from "../../../schemas";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";

export function listPlansUseCase(repo: WorkProgressRepository) {
  return async (customerId: string, raw: unknown = {}) => {
    const query = listPlansQuerySchema.parse(raw ?? {});
    return repo.listByCustomer(customerId, {
      includeArchived: query.includeArchived,
      limit: query.limit,
    });
  };
}
