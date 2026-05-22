import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";
import { updatePlanSchema } from "../../../schemas";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";

export function updatePlanUseCase(repo: WorkProgressRepository) {
  return async (customerId: string, planId: string, raw: unknown) => {
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
    return repo.updatePlan(planId, parsed.data);
  };
}
