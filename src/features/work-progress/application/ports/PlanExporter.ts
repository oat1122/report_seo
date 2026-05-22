import type { WorkProgressPlanDetail } from "../../domain/WorkProgressPlan";

export interface PlanExporter {
  exportToXlsx(plan: WorkProgressPlanDetail): Promise<Buffer>;
}
