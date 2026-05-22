import { ForbiddenError, NotFoundError } from "@/lib/errors";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";

export function deleteItemUseCase(repo: WorkProgressRepository) {
  return async (customerId: string, planId: string, itemId: string) => {
    const item = await repo.findItemById(itemId);
    if (!item) throw new NotFoundError("ไม่พบรายการ");
    if (item.planId !== planId) {
      throw new ForbiddenError("รายการไม่อยู่ในแผนงานที่ระบุ");
    }
    const plan = await repo.findById(planId);
    if (!plan || plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์ลบรายการนี้");
    }
    await repo.deleteItem(itemId);
  };
}
