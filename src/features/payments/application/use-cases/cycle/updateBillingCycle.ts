import { NotFoundError } from "@/lib/errors";
import type { PaymentRepository, UpdateCycleData } from "../../ports/PaymentRepository";

export function updateBillingCycleUseCase(repo: PaymentRepository) {
  return async (cycleId: string, data: UpdateCycleData) => {
    const existing = await repo.findCycleById(cycleId);
    if (!existing) throw new NotFoundError("ไม่พบรอบจ่ายเงิน");

    const updated = await repo.updateCycle(cycleId, data);

    // ถ้า mark PAID → ตรวจว่าทุกงวดใน plan จ่ายครบหรือยัง → auto-complete
    if (data.status === "PAID") {
      const pendingCount = await repo.countPendingCyclesByPlan(existing.planId);
      if (pendingCount === 0) {
        await repo.completePlan(existing.planId);
      }
    }

    return updated;
  };
}
