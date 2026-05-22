import { ForbiddenError, NotFoundError } from "@/lib/errors";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";

export function archivePlanUseCase(repo: WorkProgressRepository) {
  return async (
    customerId: string,
    planId: string,
    options: { isArchived: boolean } = { isArchived: true },
  ) => {
    const plan = await repo.findById(planId);
    if (!plan) throw new NotFoundError("ไม่พบแผนงาน");
    if (plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์แก้ไขแผนงานนี้");
    }
    return repo.archivePlan(planId, options.isArchived);
  };
}
