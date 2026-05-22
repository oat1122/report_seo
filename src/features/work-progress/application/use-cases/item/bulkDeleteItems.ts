import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";
import { bulkDeleteItemsSchema } from "../../../schemas";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";
import type { WorkProgressActivityRepository } from "../../ports/WorkProgressActivityRepository";

export function bulkDeleteItemsUseCase(
  repo: WorkProgressRepository,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (
    customerId: string,
    planId: string,
    actorId: string | null,
    raw: unknown,
  ) => {
    const parsed = bulkDeleteItemsSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid bulk delete data: ${detail}`);
    }
    const { itemIds } = parsed.data;

    const plan = await repo.findById(planId);
    if (!plan) throw new NotFoundError("ไม่พบแผนงาน");
    if (plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์แก้ไขแผนงานนี้");
    }

    const matched = await repo.countItemsInPlan(planId, itemIds);
    if (matched !== itemIds.length) {
      throw new BadRequestError("มีรายการที่ไม่อยู่ในแผนงานนี้");
    }

    const result = await repo.bulkDeleteItems(planId, itemIds);
    await activityRepo.log({
      planId,
      actorId,
      action: "ITEM_BULK_DELETED",
      entity: "ITEM",
      entityId: null,
      diff: { input: { itemIds }, after: result },
    });
    return result;
  };
}
