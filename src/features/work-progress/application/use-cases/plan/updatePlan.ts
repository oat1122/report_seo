import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";
import { updatePlanSchema } from "../../../schemas";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";
import type { WorkProgressActivityRepository } from "../../ports/WorkProgressActivityRepository";

export function updatePlanUseCase(
  repo: WorkProgressRepository,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (
    customerId: string,
    planId: string,
    actorId: string | null,
    raw: unknown,
  ) => {
    const parsed = updatePlanSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid update data: ${detail}`);
    }
    const plan = await repo.findById(planId);
    if (!plan) throw new NotFoundError("ไม่พบแผนงาน");
    if (plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์แก้ไขแผนงานนี้");
    }
    const updated = await repo.updatePlan(planId, parsed.data);
    await activityRepo.log({
      planId,
      actorId,
      action: "PLAN_UPDATED",
      entity: "PLAN",
      entityId: planId,
      diff: { input: parsed.data, after: updated },
    });
    return updated;
  };
}
