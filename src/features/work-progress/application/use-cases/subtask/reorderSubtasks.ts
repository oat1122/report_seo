import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";
import { reorderSubtasksSchema } from "../../../schemas";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";
import type { WorkProgressSubtaskRepository } from "../../ports/WorkProgressSubtaskRepository";

export function reorderSubtasksUseCase(
  repo: WorkProgressRepository,
  subtaskRepo: WorkProgressSubtaskRepository,
) {
  return async (
    customerId: string,
    planId: string,
    itemId: string,
    raw: unknown,
  ) => {
    const parsed = reorderSubtasksSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid reorder data: ${detail}`);
    }
    const { order } = parsed.data;

    const item = await repo.findItemById(itemId);
    if (!item) throw new NotFoundError("ไม่พบรายการ");
    if (item.planId !== planId) {
      throw new ForbiddenError("รายการไม่อยู่ในแผนงานที่ระบุ");
    }
    const plan = await repo.findById(planId);
    if (!plan || plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์แก้ไขแผนงานนี้");
    }

    await subtaskRepo.reorder(itemId, order);
    return { count: order.length };
  };
}
