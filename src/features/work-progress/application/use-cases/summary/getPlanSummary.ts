import { ForbiddenError, NotFoundError } from "@/lib/errors";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";

export function getPlanSummaryUseCase(repo: WorkProgressRepository) {
  return async (customerId: string, planId: string) => {
    const plan = await repo.findById(planId);
    if (!plan) throw new NotFoundError("ไม่พบแผนงาน");
    if (plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์เข้าถึงแผนงานนี้");
    }
    return repo.getPlanSummary(planId);
  };
}
