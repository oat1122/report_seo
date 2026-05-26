import { NotFoundError } from "@/lib/errors";
import type { PaymentRepository, UpdateCycleData } from "../../ports/PaymentRepository";

export function updateBillingCycleUseCase(repo: PaymentRepository) {
  return async (cycleId: string, data: UpdateCycleData) => {
    const existing = await repo.findCycleById(cycleId);
    if (!existing) throw new NotFoundError("ไม่พบรอบจ่ายเงิน");

    const updated = await repo.updateCycle(cycleId, data);

    if (data.status === "PAID") {
      const pendingCount = await repo.countPendingCyclesByPlan(existing.planId);
      if (pendingCount === 0) {
        await repo.completePlan(existing.planId);
      }
    }

    // ย้อนจาก PAID → PENDING/OVERDUE: ถ้า plan COMPLETED อยู่ → reactivate
    if (existing.status === "PAID" && data.status !== "PAID") {
      const plan = await repo.findPlanById(existing.planId);
      if (plan?.status === "COMPLETED") {
        await repo.reactivatePlan(existing.planId);
      }
    }

    return updated;
  };
}
