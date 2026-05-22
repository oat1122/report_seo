import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";

export function clearPeriodMarkUseCase(repo: WorkProgressRepository) {
  return async (
    customerId: string,
    planId: string,
    itemId: string,
    periodId: string,
  ) => {
    const plan = await repo.findById(planId);
    if (!plan) throw new NotFoundError("ไม่พบแผนงาน");
    if (plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์แก้ไขแผนงานนี้");
    }
    const [itemInPlan, periodInPlan] = await Promise.all([
      repo.isItemInPlan(itemId, planId),
      repo.isPeriodInPlan(periodId, planId),
    ]);
    if (!itemInPlan) throw new BadRequestError("รายการไม่อยู่ในแผนงานนี้");
    if (!periodInPlan) throw new BadRequestError("ช่วงเวลาไม่อยู่ในแผนงานนี้");
    await repo.clearPeriodMark(itemId, periodId);
  };
}
