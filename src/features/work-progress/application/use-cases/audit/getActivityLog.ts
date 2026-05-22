import { BadRequestError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { activityLogQuerySchema } from "../../../schemas";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";
import type {
  WorkProgressActivityRepository,
  ActivityListResult,
} from "../../ports/WorkProgressActivityRepository";

export function getActivityLogUseCase(
  repo: WorkProgressRepository,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (
    customerId: string,
    planId: string,
    raw: unknown,
  ): Promise<ActivityListResult> => {
    const parsed = activityLogQuerySchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid activity query: ${detail}`);
    }
    const query = parsed.data;

    const plan = await repo.findById(planId);
    if (!plan) throw new NotFoundError("ไม่พบแผนงาน");
    if (plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์เข้าถึงแผนงานนี้");
    }

    return activityRepo.list({
      planId,
      limit: query.limit,
      cursor: query.cursor,
      entity: query.entity,
      action: query.action,
    });
  };
}
