import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";
import { bulkSetPeriodMarksSchema } from "../../../schemas";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";
import type { WorkProgressMasterRepository } from "../../ports/WorkProgressMasterRepository";
import type { WorkProgressActivityRepository } from "../../ports/WorkProgressActivityRepository";

export function bulkSetPeriodMarksUseCase(
  repo: WorkProgressRepository,
  masterRepo: WorkProgressMasterRepository,
  activityRepo: WorkProgressActivityRepository,
) {
  return async (
    customerId: string,
    planId: string,
    itemId: string,
    actorId: string | null,
    raw: unknown,
  ) => {
    const parsed = bulkSetPeriodMarksSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid bulk mark data: ${detail}`);
    }
    const { marks } = parsed.data;

    const plan = await repo.findById(planId);
    if (!plan) throw new NotFoundError("ไม่พบแผนงาน");
    if (plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์แก้ไขแผนงานนี้");
    }
    const itemInPlan = await repo.isItemInPlan(itemId, planId);
    if (!itemInPlan) throw new BadRequestError("รายการไม่อยู่ในแผนงานนี้");

    // Validate ทุก period + markType พร้อมกันก่อน mutate
    const uniqueMarkTypeIds = Array.from(new Set(marks.map((m) => m.markTypeId)));
    const markTypes = await Promise.all(
      uniqueMarkTypeIds.map((id) => masterRepo.findMarkTypeById(id)),
    );
    for (let i = 0; i < uniqueMarkTypeIds.length; i++) {
      const mt = markTypes[i];
      if (!mt || !mt.isActive) {
        throw new BadRequestError(
          `markTypeId ${uniqueMarkTypeIds[i]} ไม่ถูกต้องหรือถูกปิดใช้งาน`,
        );
      }
    }
    for (const m of marks) {
      const inPlan = await repo.isPeriodInPlan(m.periodId, planId);
      if (!inPlan) {
        throw new BadRequestError(`periodId ${m.periodId} ไม่อยู่ในแผนงานนี้`);
      }
    }

    const result = await repo.bulkSetPeriodMarks(
      itemId,
      marks.map((m) => ({
        periodId: m.periodId,
        markTypeId: m.markTypeId,
        progressPercent: m.progressPercent ?? null,
        note: m.note ?? null,
      })),
    );
    await activityRepo.log({
      planId,
      actorId,
      action: "MARK_BULK_SET",
      entity: "MARK",
      entityId: null,
      diff: { input: { itemId, marks }, after: result },
    });
    return result;
  };
}
