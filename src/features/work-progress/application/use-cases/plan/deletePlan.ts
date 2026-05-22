import { ForbiddenError, NotFoundError } from "@/lib/errors";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";

// หมายเหตุ: ไม่ inject activityRepo — เพราะ plan→activity ใช้ onDelete: Cascade
// activity ของ plan ที่กำลังลบจะหายไปทั้งหมดอยู่แล้ว log PLAN_DELETED จึงถูกลบทันทีไม่มีประโยชน์
export function deletePlanUseCase(repo: WorkProgressRepository) {
  return async (customerId: string, planId: string) => {
    const plan = await repo.findById(planId);
    if (!plan) throw new NotFoundError("ไม่พบแผนงาน");
    if (plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์ลบแผนงานนี้");
    }
    await repo.deletePlan(planId);
  };
}
