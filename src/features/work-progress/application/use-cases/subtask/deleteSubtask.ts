import { ForbiddenError, NotFoundError } from "@/lib/errors";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";
import type { WorkProgressSubtaskRepository } from "../../ports/WorkProgressSubtaskRepository";

export function deleteSubtaskUseCase(
  repo: WorkProgressRepository,
  subtaskRepo: WorkProgressSubtaskRepository,
) {
  return async (
    customerId: string,
    planId: string,
    itemId: string,
    subtaskId: string,
  ) => {
    const subtask = await subtaskRepo.findById(subtaskId);
    if (!subtask) throw new NotFoundError("ไม่พบ subtask");
    if (subtask.itemId !== itemId) {
      throw new ForbiddenError("subtask ไม่อยู่ในรายการที่ระบุ");
    }
    const item = await repo.findItemById(itemId);
    if (!item || item.planId !== planId) {
      throw new ForbiddenError("รายการไม่อยู่ในแผนงานที่ระบุ");
    }
    const plan = await repo.findById(planId);
    if (!plan || plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์แก้ไขแผนงานนี้");
    }

    await subtaskRepo.delete(subtaskId);
  };
}
