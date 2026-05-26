import type { PaymentPlanType } from "../PaymentPlan";

export interface BillingCycleSeed {
  cycleNumber: number;
  dueDate: Date;
  amount: number;
}

interface GenerateParams {
  type: PaymentPlanType;
  amount: number;
  startDate: Date;
  billingDay?: number | null;
  totalInstallments?: number | null;
}

function clampDay(year: number, month: number, day: number): number {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return Math.min(day, lastDay);
}

export function generateBillingCycles(params: GenerateParams): BillingCycleSeed[] {
  const { type, amount, startDate } = params;
  const seeds: BillingCycleSeed[] = [];

  if (type === "MONTHLY") {
    const billingDay = params.billingDay ?? 1;
    const count = 12;
    for (let i = 0; i < count; i++) {
      const year = startDate.getFullYear();
      const month = startDate.getMonth() + i;
      const targetYear = year + Math.floor(month / 12);
      const targetMonth = month % 12;
      const day = clampDay(targetYear, targetMonth, billingDay);
      seeds.push({
        cycleNumber: i + 1,
        dueDate: new Date(targetYear, targetMonth, day),
        amount,
      });
    }
  } else {
    const total = params.totalInstallments ?? 1;
    for (let i = 0; i < total; i++) {
      const year = startDate.getFullYear();
      const month = startDate.getMonth() + i;
      const targetYear = year + Math.floor(month / 12);
      const targetMonth = month % 12;
      const day = clampDay(targetYear, targetMonth, startDate.getDate());
      seeds.push({
        cycleNumber: i + 1,
        dueDate: new Date(targetYear, targetMonth, day),
        amount,
      });
    }
  }

  return seeds;
}
