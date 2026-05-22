import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";
import { reorderItemsSchema } from "../../../schemas";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";

export function reorderItemsUseCase(repo: WorkProgressRepository) {
  return async (customerId: string, planId: string, raw: unknown) => {
    const parsed = reorderItemsSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid reorder data: ${detail}`);
    }
    const plan = await repo.findById(planId);
    if (!plan) throw new NotFoundError("ไม่พบแผนงาน");
    if (plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์แก้ไขแผนงานนี้");
    }

    // ตรวจทุก itemId อยู่ใน plan นี้ — กัน path manipulation
    for (const entry of parsed.data.order) {
      const inPlan = await repo.isItemInPlan(entry.itemId, planId);
      if (!inPlan) {
        throw new BadRequestError(`itemId ${entry.itemId} ไม่อยู่ในแผนงานนี้`);
      }
    }

    await repo.reorderItems(planId, parsed.data.order);
  };
}
