// Composition root — instantiate adapter ครั้งเดียว แล้ว inject เข้า use case factory
// Public API: export เฉพาะ use case (bound function) + schema + DTO type
// ห้าม leak Prisma type ออกผ่านที่นี่ (rule 09)

import { PrismaWorkProgressMasterRepository } from "./infrastructure/PrismaWorkProgressMasterRepository";
import { PrismaWorkProgressRepository } from "./infrastructure/PrismaWorkProgressRepository";
import { PrismaWorkProgressTemplateRepository } from "./infrastructure/PrismaWorkProgressTemplateRepository";

import { createPlanUseCase } from "./application/use-cases/plan/createPlan";
import { listPlansUseCase } from "./application/use-cases/plan/listPlans";
import { getPlanDetailUseCase } from "./application/use-cases/plan/getPlanDetail";
import { updatePlanUseCase } from "./application/use-cases/plan/updatePlan";
import { archivePlanUseCase } from "./application/use-cases/plan/archivePlan";
import { deletePlanUseCase } from "./application/use-cases/plan/deletePlan";

import { addItemUseCase } from "./application/use-cases/item/addItem";
import { updateItemUseCase } from "./application/use-cases/item/updateItem";
import { deleteItemUseCase } from "./application/use-cases/item/deleteItem";
import { reorderItemsUseCase } from "./application/use-cases/item/reorderItems";

import { setPeriodMarkUseCase } from "./application/use-cases/mark/setPeriodMark";
import { clearPeriodMarkUseCase } from "./application/use-cases/mark/clearPeriodMark";
import { bulkSetPeriodMarksUseCase } from "./application/use-cases/mark/bulkSetPeriodMarks";

import { listCategoriesUseCase } from "./application/use-cases/master/listCategories";
import { listStatusesUseCase } from "./application/use-cases/master/listStatuses";
import { listMarkTypesUseCase } from "./application/use-cases/master/listMarkTypes";
import {
  createCategoryUseCase,
  updateCategoryUseCase,
} from "./application/use-cases/master/upsertCategory";
import {
  createStatusUseCase,
  updateStatusUseCase,
} from "./application/use-cases/master/upsertStatus";
import {
  createMarkTypeUseCase,
  updateMarkTypeUseCase,
} from "./application/use-cases/master/upsertMarkType";
import { deactivateMasterRowUseCase } from "./application/use-cases/master/deactivateMasterRow";

import { getPlanSummaryUseCase } from "./application/use-cases/summary/getPlanSummary";

import { listTemplatesUseCase } from "./application/use-cases/template/listTemplates";
import { getTemplateUseCase } from "./application/use-cases/template/getTemplate";
import {
  createTemplateUseCase,
  updateTemplateUseCase,
} from "./application/use-cases/template/upsertTemplate";
import { deleteTemplateUseCase } from "./application/use-cases/template/deleteTemplate";
import { reorderTemplateItemsUseCase } from "./application/use-cases/template/reorderTemplateItems";
import { addTemplateItemUseCase } from "./application/use-cases/template/addTemplateItem";
import { updateTemplateItemUseCase } from "./application/use-cases/template/updateTemplateItem";
import { deleteTemplateItemUseCase } from "./application/use-cases/template/deleteTemplateItem";
import { savePlanAsTemplateUseCase } from "./application/use-cases/template/savePlanAsTemplate";

const repo = new PrismaWorkProgressRepository();
const masterRepo = new PrismaWorkProgressMasterRepository();
const templateRepo = new PrismaWorkProgressTemplateRepository();

// Plan
export const createPlan = createPlanUseCase(repo, masterRepo, templateRepo);
export const listPlans = listPlansUseCase(repo);
export const getPlanDetail = getPlanDetailUseCase(repo);
export const updatePlan = updatePlanUseCase(repo);
export const archivePlan = archivePlanUseCase(repo);
export const deletePlan = deletePlanUseCase(repo);

// Item
export const addItem = addItemUseCase(repo, masterRepo);
export const updateItem = updateItemUseCase(repo, masterRepo);
export const deleteItem = deleteItemUseCase(repo);
export const reorderItems = reorderItemsUseCase(repo);

// Mark
export const setPeriodMark = setPeriodMarkUseCase(repo, masterRepo);
export const clearPeriodMark = clearPeriodMarkUseCase(repo);
export const bulkSetPeriodMarks = bulkSetPeriodMarksUseCase(repo, masterRepo);

// Master
export const listCategories = listCategoriesUseCase(masterRepo);
export const listStatuses = listStatusesUseCase(masterRepo);
export const listMarkTypes = listMarkTypesUseCase(masterRepo);
export const createCategory = createCategoryUseCase(masterRepo);
export const updateCategory = updateCategoryUseCase(masterRepo);
export const createStatus = createStatusUseCase(masterRepo);
export const updateStatus = updateStatusUseCase(masterRepo);
export const createMarkType = createMarkTypeUseCase(masterRepo);
export const updateMarkType = updateMarkTypeUseCase(masterRepo);
export const deactivateMasterRow = deactivateMasterRowUseCase(masterRepo);

// Summary
export const getPlanSummary = getPlanSummaryUseCase(repo);

// Template (Phase 2)
export const listTemplates = listTemplatesUseCase(templateRepo);
export const getTemplate = getTemplateUseCase(templateRepo);
export const createTemplate = createTemplateUseCase(templateRepo, masterRepo);
export const updateTemplate = updateTemplateUseCase(templateRepo);
export const deleteTemplate = deleteTemplateUseCase(templateRepo);
export const reorderTemplateItems = reorderTemplateItemsUseCase(templateRepo);
export const addTemplateItem = addTemplateItemUseCase(templateRepo, masterRepo);
export const updateTemplateItem = updateTemplateItemUseCase(
  templateRepo,
  masterRepo,
);
export const deleteTemplateItem = deleteTemplateItemUseCase(templateRepo);
export const savePlanAsTemplate = savePlanAsTemplateUseCase(
  repo,
  templateRepo,
);

// Re-export schemas + DTO types สำหรับ route handler
export {
  createPlanSchema,
  updatePlanSchema,
  listPlansQuerySchema,
  addItemSchema,
  updateItemSchema,
  reorderItemsSchema,
  setPeriodMarkSchema,
  bulkSetPeriodMarksSchema,
  upsertCategorySchema,
  updateCategorySchema,
  upsertStatusSchema,
  updateStatusSchema,
  upsertMarkTypeSchema,
  updateMarkTypeSchema,
  masterIdParamSchema,
  masterKindSchema,
  upsertTemplateSchema,
  updateTemplateSchema,
  addTemplateItemSchema,
  updateTemplateItemSchema,
  reorderTemplateItemsSchema,
  listTemplatesQuerySchema,
  templateIdParamSchema,
  savePlanAsTemplateSchema,
  type CreatePlanInput,
  type UpdatePlanInput,
  type AddItemInput,
  type UpdateItemInput,
  type ReorderItemsInput,
  type SetPeriodMarkInput,
  type BulkSetPeriodMarksInput,
  type UpsertCategoryInput,
  type UpdateCategoryInput,
  type UpsertStatusInput,
  type UpdateStatusInput,
  type UpsertMarkTypeInput,
  type UpdateMarkTypeInput,
  type MasterKindCode,
  type UpsertTemplateInput,
  type UpdateTemplateInput,
  type AddTemplateItemInput,
  type UpdateTemplateItemInput,
  type ReorderTemplateItemsInput,
  type ListTemplatesQuery,
  type SavePlanAsTemplateInput,
} from "./schemas";

export type {
  WorkProgressPlan,
  WorkProgressPlanDetail,
  WorkProgressItemWithMarks,
  WorkProgressPeriodMarkWithType,
} from "./domain/WorkProgressPlan";
export type {
  WorkProgressItem,
  WorkProgressItemPeriodMark,
} from "./domain/WorkProgressItem";
export type { WorkProgressPeriod } from "./domain/WorkProgressPeriod";
export type {
  WorkProgressCategory,
  WorkProgressStatus,
  WorkProgressMarkType,
  MasterKind,
} from "./domain/WorkProgressMaster";
export type {
  WorkProgressTemplate,
  WorkProgressTemplateItem,
  WorkProgressTemplateDetail,
} from "./domain/WorkProgressTemplate";
export type { PeriodTypeCode } from "./domain/types";
