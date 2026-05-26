import { NotFoundError } from "@/lib/errors";
import type { PaymentRepository, UpdatePlanData } from "../../ports/PaymentRepository";

export function updatePaymentPlanUseCase(repo: PaymentRepository) {
  return async (planId: string, data: UpdatePlanData) => {
    const existing = await repo.findPlanById(planId);
    if (!existing) throw new NotFoundError("ไม่พบแผนชำระเงิน");
    return repo.updatePlan(planId, data);
  };
}
