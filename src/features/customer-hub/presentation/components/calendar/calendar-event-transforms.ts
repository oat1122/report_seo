import "temporal-spec/global";
import type { CalendarEvent } from "@schedule-x/calendar";
import type {
  WorkProgressPlanDetail,
  WorkProgressItemWithMarks,
} from "@/features/work-progress";
import type { BillingCycleWithPlan } from "@/features/payments";
import type { BillingCycleStatus } from "@/features/payments";

function toPlainDate(date: Date | string): Temporal.PlainDate {
  const d = typeof date === "string" ? new Date(date) : date;
  return Temporal.PlainDate.from({
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  });
}

const STATUS_TO_CALENDAR_ID: Record<BillingCycleStatus, string> = {
  PAID: "payment-paid",
  OVERDUE: "payment-overdue",
  PENDING: "payment-pending",
  REVIEWING: "payment-reviewing",
  CANCELLED: "payment-cancelled",
};

export type CalendarItemLookup = Map<string, WorkProgressItemWithMarks & { planTitle: string }>;

export function workProgressPlanToEvents(
  plan: WorkProgressPlanDetail,
  itemLookup: CalendarItemLookup,
): CalendarEvent[] {
  const periodMap = new Map(plan.periods.map((p) => [p.id, p]));

  return plan.items
    .map((item) => {
      let start: Temporal.PlainDate | null = null;
      let end: Temporal.PlainDate | null = null;

      if (item.startDate != null && item.dueDate != null) {
        start = toPlainDate(item.startDate);
        end = toPlainDate(item.dueDate);
      } else if (item.periodMarks.length > 0) {
        const markedPeriods = item.periodMarks
          .map((m) => periodMap.get(m.periodId))
          .filter((p) => p != null && p.startDate != null && p.endDate != null)
          .sort((a, b) => a!.seq - b!.seq);

        if (markedPeriods.length > 0) {
          start = toPlainDate(markedPeriods[0]!.startDate!);
          end = toPlainDate(markedPeriods[markedPeriods.length - 1]!.endDate!);
        }
      }

      if (!start || !end) return null;

      const eventId = `wp-${item.id}`;
      itemLookup.set(eventId, { ...item, planTitle: plan.title });

      return {
        id: eventId,
        start,
        end,
        title: item.activity,
        calendarId: "work-progress",
        _customContent: {
          categoryName: item.category.name,
          statusName: item.status.name,
          planTitle: plan.title,
        },
      };
    })
    .filter((e): e is NonNullable<typeof e> => e != null);
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function billingCyclesToEvents(
  cycles: BillingCycleWithPlan[],
): CalendarEvent[] {
  return cycles
    .filter((c) => c.status !== "CANCELLED")
    .map((cycle) => {
      const date = toPlainDate(cycle.dueDate);
      return {
        id: `pay-${cycle.id}`,
        start: date,
        end: date,
        title: `${cycle.plan.description} - ฿${formatAmount(cycle.amount)}`,
        calendarId: STATUS_TO_CALENDAR_ID[cycle.status],
        _customContent: {
          status: cycle.status,
          amount: String(cycle.amount),
          cycleNumber: String(cycle.cycleNumber),
          planDescription: cycle.plan.description,
        },
      };
    });
}
