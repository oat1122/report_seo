import type { PlanExporter } from "../application/ports/PlanExporter";
import type { WorkProgressPlanDetail } from "../domain/WorkProgressPlan";

export class XlsxPlanExporter implements PlanExporter {
  async exportToXlsx(plan: WorkProgressPlanDetail): Promise<Buffer> {
    const xlsx = await import("xlsx");

    const periods = plan.periods.slice().sort((a, b) => a.seq - b.seq);
    const periodHeaders = periods.map((p) => p.label);

    const header = [
      "หมวด",
      "กิจกรรม",
      "สถานะ",
      "%",
      "ระยะ",
      ...periodHeaders,
      "หมายเหตุ",
    ];

    const items = plan.items
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex);

    const rows = items.map((item) => {
      const markByPeriod = new Map(
        item.periodMarks.map((m) => [m.periodId, m.markType.code] as const),
      );
      return [
        item.category.name,
        item.activity,
        item.status.name,
        item.progressPercent,
        item.duration ?? "",
        ...periods.map((p) => markByPeriod.get(p.id) ?? ""),
        item.note ?? "",
      ];
    });

    const sheet = xlsx.utils.aoa_to_sheet([header, ...rows]);

    const titleRow = [`Plan: ${plan.title}`];
    if (plan.year) titleRow.push(`ปี: ${plan.year}`);
    if (plan.packageName) titleRow.push(`Package: ${plan.packageName}`);
    xlsx.utils.sheet_add_aoa(sheet, [titleRow], { origin: -1 });

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, sheet, "Work Progress");

    const out = xlsx.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
    return out;
  }
}
