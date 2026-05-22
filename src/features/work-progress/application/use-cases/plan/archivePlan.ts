import { ForbiddenError, NotFoundError } from "@/lib/errors";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";
import type { WorkProgressActivityRepository } from "../../ports/WorkProgressActivityRepository";

export function archivePlanUseCase(
  repo: WorkProgressRepository,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (
    customerId: string,
    planId: string,
    actorId: string | null,
    options: { isArchived: boolean } = { isArchived: true },
  ) => {
    const plan = await repo.findById(planId);
    if (!plan) throw new NotFoundError("ไม่พบแผนงาน");
    if (plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์แก้ไขแผนงานนี้");
    }
    const updated = await repo.archivePlan(planId, options.isArchived);
    await activityRepo.log({
      planId,
      actorId,
      action: "PLAN_ARCHIVED",
      entity: "PLAN",
      entityId: planId,
      diff: { input: options, after: updated },
    });
    return updated;
  };
}
