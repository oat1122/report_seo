import { BadRequestError } from "@/lib/errors";
import { recentChangesQuerySchema } from "../../../schemas";
import type { WorkProgressActivityRepository } from "../../ports/WorkProgressActivityRepository";
import type { WorkProgressActivity } from "../../../domain/WorkProgressActivity";

export function getRecentChangesUseCase(
  activityRepo: WorkProgressActivityRepository,
) {
  return async (
    customerId: string,
    raw: unknown,
  ): Promise<WorkProgressActivity[]> => {
    const parsed = recentChangesQuerySchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid recent-changes query: ${detail}`);
    }
    return activityRepo.listRecentForCustomer(customerId, parsed.data.limit);
  };
}
