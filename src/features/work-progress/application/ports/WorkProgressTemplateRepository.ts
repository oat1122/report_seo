import type {
  WorkProgressTemplate,
  WorkProgressTemplateDetail,
  WorkProgressTemplateItem,
  WorkProgressTemplateSubtask,
} from "../../domain/WorkProgressTemplate";
import type { PeriodTypeCode } from "../../domain/types";

export interface TemplateSubtaskSeed {
  title: string;
  orderIndex?: number;
}

export interface CreateTemplateData {
  name: string;
  description: string | null;
  periodType: PeriodTypeCode;
  durationMonths: number;
  isActive: boolean;
  createdById: string | null;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string | null;
  periodType?: PeriodTypeCode;
  durationMonths?: number;
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
  subtasks?: readonly TemplateSubtaskSeed[];
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

  // Template item subtask
  listItemSubtasks(itemId: string): Promise<WorkProgressTemplateSubtask[]>;
  addItemSubtask(
    itemId: string,
    data: TemplateSubtaskSeed,
  ): Promise<WorkProgressTemplateSubtask>;
  updateItemSubtask(
    subtaskId: string,
    data: { title?: string; orderIndex?: number },
  ): Promise<WorkProgressTemplateSubtask>;
  deleteItemSubtask(subtaskId: string): Promise<void>;
  findItemSubtaskById(
    subtaskId: string,
  ): Promise<
    | (WorkProgressTemplateSubtask & {
        templateItem: WorkProgressTemplateItem & {
          template: WorkProgressTemplate;
        };
      })
    | null
  >;
  replaceItemSubtasks(
    itemId: string,
    subtasks: readonly TemplateSubtaskSeed[],
  ): Promise<void>;
}
