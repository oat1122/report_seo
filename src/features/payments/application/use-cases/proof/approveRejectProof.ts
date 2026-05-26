import { NotFoundError } from "@/lib/errors";
import type { PaymentRepository } from "../../ports/PaymentRepository";

export function approveRejectProofUseCase(repo: PaymentRepository) {
  return async (proofId: string, status: "APPROVED" | "REJECTED") => {
    const proof = await repo.findProofById(proofId);
    if (!proof) throw new NotFoundError("ไม่พบหลักฐานการชำระเงิน");

    const updated = await repo.updateProofStatus(proofId, status);

    // ถ้า approve + ผูกกับ billing cycle → auto-mark cycle เป็น PAID
    if (status === "APPROVED" && proof.billingCycleId) {
      const cycle = await repo.findCycleById(proof.billingCycleId);
      if (cycle && cycle.status === "PENDING") {
        await repo.updateCycle(proof.billingCycleId, {
          status: "PAID",
          paidDate: new Date(),
        });

        const pendingCount = await repo.countPendingCyclesByPlan(cycle.planId);
        if (pendingCount === 0) {
          await repo.completePlan(cycle.planId);
        }
      }
    }

    return updated;
  };
}
