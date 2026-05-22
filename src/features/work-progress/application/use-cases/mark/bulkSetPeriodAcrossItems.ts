import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";
import { bulkSetPeriodAcrossItemsSchema } from "../../../schemas";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";
import type { WorkProgressMasterRepository } from "../../ports/WorkProgressMasterRepository";
import type { WorkProgressActivityRepository } from "../../ports/WorkProgressActivityRepository";

export function bulkSetPeriodAcrossItemsUseCase(
  repo: WorkProgressRepository,
  masterRepo: WorkProgressMasterRepository,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (
    customerId: string,
    planId: string,
    actorId: string | null,
    raw: unknown,
  ) => {
    const parsed = bulkSetPeriodAcrossItemsSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid bulk period mark data: ${detail}`);
    }
    const { periodId, itemIds, markTypeId, progressPercent, note } = parsed.data;

    const plan = await repo.findById(planId);
    if (!plan) throw new NotFoundError("ไม่พบแผนงาน");
    if (plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์แก้ไขแผนงานนี้");
    }

    const periodOk = await repo.isPeriodInPlan(periodId, planId);
    if (!periodOk) throw new BadRequestError("periodId ไม่อยู่ในแผนงานนี้");

    const matched = await repo.countItemsInPlan(planId, itemIds);
    if (matched !== itemIds.length) {
      throw new BadRequestError("มีรายการที่ไม่อยู่ในแผนงานนี้");
    }

    if (markTypeId !== null) {
      const mt = await masterRepo.findMarkTypeById(markTypeId);
      if (!mt || !mt.isActive) {
        throw new BadRequestError("markType ไม่ถูกต้องหรือถูกปิดใช้งาน");
      }
    }

    const result = await repo.bulkSetPeriodAcrossItems(
      planId,
      periodId,
      itemIds,
      {
        markTypeId,
        progressPercent: progressPercent ?? null,
        note: note ?? null,
      },
    );

    await activityRepo.log({
      planId,
      actorId,
      action: "MARK_PERIOD_BULK_SET",
      entity: "MARK",
      entityId: null,
      diff: {
        input: { periodId, itemIds, markTypeId, progressPercent, note },
        after: result,
      },
    });
    return result;
  };
}
