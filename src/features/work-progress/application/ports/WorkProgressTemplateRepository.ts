import type {
  WorkProgressTemplate,
  WorkProgressTemplateDetail,
  WorkProgressTemplateItem,
} from "../../domain/WorkProgressTemplate";
import type { PeriodTypeCode } from "../../domain/types";

export interface CreateTemplateData {
  name: string;
  description: string | null;
  periodType: PeriodTypeCode;
  isActive: boolean;
  createdById: string | null;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string | null;
  periodType?: PeriodTypeCode;
  isActive?: boolean;
}

export interface CreateTemplateItemData {
  categoryId: string;
  activity: string;
  description: string | null;
  duration: string | null;
  weight: number;
  orderIndex: number;
  defaultPeriods: Record<string, unknown> | null;
}

export interface UpdateTemplateItemData {
  categoryId?: string;
  activity?: string;
  description?: string | null;
  duration?: string | null;
  weight?: number;
  orderIndex?: number;
  defaultPeriods?: Record<string, unknown> | null;
}

export interface WorkProgressTemplateRepository {
  list(options: { includeInactive: boolean }): Promise<WorkProgressTemplate[]>;
  findById(id: string): Promise<WorkProgressTemplateDetail | null>;

  create(
    data: CreateTemplateData,
    items: readonly CreateTemplateItemData[],
  ): Promise<WorkProgressTemplateDetail>;
  update(id: string, data: UpdateTemplateData): Promise<WorkProgressTemplate>;
  delete(id: string): Promise<void>;

  addItem(
    templateId: string,
    data: CreateTemplateItemData,
  ): Promise<WorkProgressTemplateItem>;
  updateItem(
    itemId: string,
    data: UpdateTemplateItemData,
  ): Promise<WorkProgressTemplateItem>;
  deleteItem(itemId: string): Promise<void>;
  findItemById(itemId: string): Promise<
    | (WorkProgressTemplateItem & { template: WorkProgressTemplate })
    | null
  >;
  reorderItems(
    templateId: string,
    order: ReadonlyArray<{ itemId: string; orderIndex: number }>,
  ): Promise<void>;
}
