import { prisma } from "@/infrastructure/prisma/client";
import type {
  BillingCycleProvider,
  BillingCycleInfo,
} from "../application/ports/BillingCycleProvider";

function toInfo(row: {
  id: string;
  cycleNumber: number;
  dueDate: Date;
  paidDate: Date | null;
  amount: unknown;
  planId: string;
  plan: { id: string; description: string; customerId: string };
}): BillingCycleInfo {
  return {
    id: row.id,
    cycleNumber: row.cycleNumber,
    dueDate: row.dueDate,
    paidDate: row.paidDate,
    amount: Number(row.amount),
    planId: row.planId,
    planDescription: row.plan.description,
    planCustomerId: row.plan.customerId,
  };
}

const planSelect = {
  select: { id: true, description: true, customerId: true },
} as const;

export class PrismaBillingCycleProvider implements BillingCycleProvider {
  async getCycleById(cycleId: string): Promise<BillingCycleInfo | null> {
    const row = await prisma.billingCycle.findUnique({
      where: { id: cycleId },
      include: { plan: planSelect },
    });
    return row ? toInfo(row) : null;
  }

  async listCyclesByCustomer(
    customerId: string,
  ): Promise<BillingCycleInfo[]> {
    const rows = await prisma.billingCycle.findMany({
      where: { plan: { customerId } },
      include: { plan: planSelect },
      orderBy: { dueDate: "asc" },
    });
    return rows.map(toInfo);
  }
}
