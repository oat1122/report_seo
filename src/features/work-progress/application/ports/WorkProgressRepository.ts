import type {
  WorkProgressPlan,
  WorkProgressPlanDetail,
} from "../../domain/WorkProgressPlan";
import type { WorkProgressItem } from "../../domain/WorkProgressItem";
import type { WorkProgressItemPeriodMark } from "../../domain/WorkProgressItem";
import type { PeriodSeed } from "../../domain/policies/period-generator";

export interface CreatePlanData {
  customerId: string;
  title: string;
  periodType: WorkProgressPlan["periodType"];
  year: number | null;
  startDate: Date | null;
  endDate: Date | null;
  packageName: string | null;
  note: string | null;
}

export interface UpdatePlanData {
  title?: string;
  year?: number | null;
  packageName?: string | null;
  note?: string | null;
}

export interface AddItemData {
  planId: string;
  categoryId: string;
  statusId: string;
  activity: string;
  description: string | null;
  duration: string | null;
  note: string | null;
  weight: number;
  orderIndex: number | null;
  startDate: Date | null;
  dueDate: Date | null;
}

export interface UpdateItemData {
  categoryId?: string;
  statusId?: string;
  activity?: string;
  description?: string | null;
  duration?: string | null;
  note?: string | null;
  weight?: number;
  progressPercent?: number;
  startDate?: Date | null;
  dueDate?: Date | null;
  completedAt?: Date | null; // ตั้งโดย use case ตอน status terminal
}

export interface SetMarkData {
  itemId: string;
  periodId: string;
  markTypeId: string;
  progressPercent: number | null;
  note: string | null;
}

export interface PlanSummary {
  planId: string;
  overallPercent: number;
  itemCount: number;
  byCategory: Array<{
    categoryId: string;
    overallPercent: number;
    itemCount: number;
  }>;
  byPeriod: Array<{
    periodId: string;
    seq: number;
    label: string;
    markCount: number;
  }>;
}

export interface WorkProgressRepository {
  // Plan CRUD
  createPlanWithPeriods(
    data: CreatePlanData,
    periods: readonly PeriodSeed[],
  ): Promise<WorkProgressPlan>;
  listByCustomer(
    customerId: string,
    options: { includeArchived: boolean; limit: number },
  ): Promise<WorkProgressPlan[]>;
  findById(planId: string): Promise<WorkProgressPlan | null>;
  findDetail(planId: string): Promise<WorkProgressPlanDetail | null>;
  updatePlan(planId: string, data: UpdatePlanData): Promise<WorkProgressPlan>;
  archivePlan(planId: string, isArchived: boolean): Promise<WorkProgressPlan>;
  deletePlan(planId: string): Promise<void>;

  // Item CRUD
  addItem(data: AddItemData): Promise<WorkProgressItem>;
  findItemById(itemId: string): Promise<WorkProgressItem | null>;
  updateItem(itemId: string, data: UpdateItemData): Promise<WorkProgressItem>;
  deleteItem(itemId: string): Promise<void>;
  reorderItems(
    planId: string,
    order: ReadonlyArray<{ itemId: string; orderIndex: number }>,
  ): Promise<void>;

  // Mark CRUD
  setPeriodMark(data: SetMarkData): Promise<WorkProgressItemPeriodMark>;
  clearPeriodMark(itemId: string, periodId: string): Promise<void>;
  bulkSetPeriodMarks(
    itemId: string,
    marks: ReadonlyArray<Omit<SetMarkData, "itemId">>,
  ): Promise<{ count: number }>;

  // Cross-plan validators (ใช้ใน use case ก่อน mutate)
  isPeriodInPlan(periodId: string, planId: string): Promise<boolean>;
  isItemInPlan(itemId: string, planId: string): Promise<boolean>;

  // Summary
  getPlanSummary(planId: string): Promise<PlanSummary>;
}
