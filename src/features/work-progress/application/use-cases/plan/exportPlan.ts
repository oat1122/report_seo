import { ForbiddenError, NotFoundError } from "@/lib/errors";
import type { WorkProgressRepository } from "../../ports/WorkProgressRepository";
import type { PlanExporter } from "../../ports/PlanExporter";

export interface ExportPlanResult {
  buffer: Buffer;
  filename: string;
}

export function exportPlanUseCase(
  repo: WorkProgressRepository,
  exporter: PlanExporter,
) {
  return async (
    customerId: string,
    planId: string,
  ): Promise<ExportPlanResult> => {
    const plan = await repo.findDetail(planId);
    if (!plan) throw new NotFoundError("ไม่พบแผนงาน");
    if (plan.customerId !== customerId) {
      throw new ForbiddenError("ไม่มีสิทธิ์เข้าถึงแผนงานนี้");
    }

    const buffer = await exporter.exportToXlsx(plan);
    const safeTitle = sanitizeFilename(plan.title);
    const yearSuffix = plan.year ? `-${plan.year}` : "";
    return {
      buffer,
      filename: `${safeTitle}${yearSuffix}.xlsx`,
    };
  };
}

function sanitizeFilename(value: string): string {
  return (
    value
      .replace(/[\\/:*?"<>|]/g, "_")
      .replace(/\s+/g, "_")
      .slice(0, 80) || "work-progress"
  );
}
