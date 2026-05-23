// Composition root — instantiate adapter ครั้งเดียว แล้ว inject เข้า use case factory
// Public API: export เฉพาะ use case (bound function) + schema + DTO type
// ห้าม leak Prisma type ออกผ่านที่นี่ (rule 09)

import { prisma } from "@/infrastructure/prisma/client";

import { PrismaWorkProgressMasterRepository } from "./infrastructure/PrismaWorkProgressMasterRepository";
import { PrismaWorkProgressRepository } from "./infrastructure/PrismaWorkProgressRepository";
import { PrismaWorkProgressTemplateRepository } from "./infrastructure/PrismaWorkProgressTemplateRepository";
import { PrismaWorkProgressSubtaskRepository } from "./infrastructure/PrismaWorkProgressSubtaskRepository";
import { PrismaWorkProgressAttachmentRepository } from "./infrastructure/PrismaWorkProgressAttachmentRepository";
import { PrismaWorkProgressItemMetaRepository } from "./infrastructure/PrismaWorkProgressItemMetaRepository";
import { PrismaWorkProgressActivityRepository } from "./infrastructure/PrismaWorkProgressActivityRepository";
import { LocalWorkProgressAttachmentStorage } from "./infrastructure/LocalWorkProgressAttachmentStorage";

import type { AssigneeLookup } from "./application/policies/assignee-guard";

import { createPlanUseCase } from "./application/use-cases/plan/createPlan";
import { listPlansUseCase } from "./application/use-cases/plan/listPlans";
import { getPlanDetailUseCase } from "./application/use-cases/plan/getPlanDetail";
import { archivePlanUseCase } from "./application/use-cases/plan/archivePlan";
import { deletePlanUseCase } from "./application/use-cases/plan/deletePlan";
import { importPlanItemsUseCase } from "./application/use-cases/plan/importPlanItems";

import { addItemUseCase } from "./application/use-cases/item/addItem";
import { updateItemUseCase } from "./application/use-cases/item/updateItem";
import { deleteItemUseCase } from "./application/use-cases/item/deleteItem";
import { reorderItemsUseCase } from "./application/use-cases/item/reorderItems";
import { assignItemUseCase } from "./application/use-cases/item/assignItem";
import { bulkUpdateItemStatusUseCase } from "./application/use-cases/item/bulkUpdateItemStatus";
import { bulkDeleteItemsUseCase } from "./application/use-cases/item/bulkDeleteItems";

import { setPeriodMarkUseCase } from "./application/use-cases/mark/setPeriodMark";
import { clearPeriodMarkUseCase } from "./application/use-cases/mark/clearPeriodMark";
import { bulkSetPeriodAcrossItemsUseCase } from "./application/use-cases/mark/bulkSetPeriodAcrossItems";

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

// Phase 3 use cases
import { addSubtaskUseCase } from "./application/use-cases/subtask/addSubtask";
import { updateSubtaskUseCase } from "./application/use-cases/subtask/updateSubtask";
import { toggleSubtaskUseCase } from "./application/use-cases/subtask/toggleSubtask";
import { reorderSubtasksUseCase } from "./application/use-cases/subtask/reorderSubtasks";
import { deleteSubtaskUseCase } from "./application/use-cases/subtask/deleteSubtask";
import { uploadAttachmentUseCase } from "./application/use-cases/attachment/uploadAttachment";
import { addLinkAttachmentUseCase } from "./application/use-cases/attachment/addLinkAttachment";
import { deleteAttachmentUseCase } from "./application/use-cases/attachment/deleteAttachment";
import { upsertMetaUseCase } from "./application/use-cases/meta/upsertMeta";
import { deleteMetaUseCase } from "./application/use-cases/meta/deleteMeta";

// Phase 4 — Audit & Insights
import { getDashboardSummaryUseCase } from "./application/use-cases/summary/getDashboardSummary";

const repo = new PrismaWorkProgressRepository();
const masterRepo = new PrismaWorkProgressMasterRepository();
const templateRepo = new PrismaWorkProgressTemplateRepository();
const subtaskRepo = new PrismaWorkProgressSubtaskRepository();
const attachmentRepo = new PrismaWorkProgressAttachmentRepository();
const metaRepo = new PrismaWorkProgressItemMetaRepository();
const activityRepo = new PrismaWorkProgressActivityRepository();
const attachmentStorage = new LocalWorkProgressAttachmentStorage();

// Lookup user สำหรับ assignee guard — bypass soft-delete filter ผ่าน extended client ก็พอ
// (extended client กรอง deletedAt ให้แล้ว ดังนั้นถ้า user ถูกลบ → คืน null อัตโนมัติ)
const lookupAssignee: AssigneeLookup = async (userId) => {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, deletedAt: true },
  });
  return u ? { id: u.id, role: u.role, deletedAt: u.deletedAt } : null;
};

// Plan
export const createPlan = createPlanUseCase(
  repo,
  masterRepo,
  templateRepo,
  activityRepo,
);
export const listPlans = listPlansUseCase(repo);
export const getPlanDetail = getPlanDetailUseCase(repo);
export const archivePlan = archivePlanUseCase(repo, activityRepo);
export const deletePlan = deletePlanUseCase(repo);
export const importPlanItems = importPlanItemsUseCase(
  repo,
  masterRepo,
  activityRepo,
);

// Item
export const addItem = addItemUseCase(repo, masterRepo, activityRepo);
export const updateItem = updateItemUseCase(repo, masterRepo, activityRepo);
export const deleteItem = deleteItemUseCase(repo, activityRepo);
export const reorderItems = reorderItemsUseCase(repo, activityRepo);
export const assignItem = assignItemUseCase(repo, lookupAssignee, activityRepo);
export const bulkUpdateItemStatus = bulkUpdateItemStatusUseCase(
  repo,
  masterRepo,
  activityRepo,
);
export const bulkDeleteItems = bulkDeleteItemsUseCase(repo, activityRepo);

// Mark
export const setPeriodMark = setPeriodMarkUseCase(
  repo,
  masterRepo,
  activityRepo,
);
export const clearPeriodMark = clearPeriodMarkUseCase(repo, activityRepo);
export const bulkSetPeriodAcrossItems = bulkSetPeriodAcrossItemsUseCase(
  repo,
  masterRepo,
  activityRepo,
);

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

// Phase 3 — Rich Items
export const addSubtask = addSubtaskUseCase(
  repo,
  subtaskRepo,
  lookupAssignee,
  activityRepo,
);
export const updateSubtask = updateSubtaskUseCase(
  repo,
  subtaskRepo,
  lookupAssignee,
  activityRepo,
);
export const toggleSubtask = toggleSubtaskUseCase(
  repo,
  subtaskRepo,
  activityRepo,
);
export const reorderSubtasks = reorderSubtasksUseCase(
  repo,
  subtaskRepo,
  activityRepo,
);
export const deleteSubtask = deleteSubtaskUseCase(
  repo,
  subtaskRepo,
  activityRepo,
);

export const uploadAttachment = uploadAttachmentUseCase(
  repo,
  attachmentRepo,
  attachmentStorage,
  activityRepo,
);
export const addLinkAttachment = addLinkAttachmentUseCase(
  repo,
  attachmentRepo,
  activityRepo,
);
export const deleteAttachment = deleteAttachmentUseCase(
  repo,
  attachmentRepo,
  attachmentStorage,
  activityRepo,
);

export const upsertMeta = upsertMetaUseCase(repo, metaRepo, activityRepo);
export const deleteMeta = deleteMetaUseCase(repo, metaRepo, activityRepo);

// Phase 4 — Audit & Insights
export const getDashboardSummary = getDashboardSummaryUseCase(
  repo,
  activityRepo,
);

// Re-export schemas + DTO types สำหรับ route handler
export {
  createPlanSchema,
  listPlansQuerySchema,
  addItemSchema,
  updateItemSchema,
  reorderItemsSchema,
  assignItemSchema,
  setPeriodMarkSchema,
  bulkSetPeriodAcrossItemsSchema,
  bulkUpdateItemStatusSchema,
  bulkDeleteItemsSchema,
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
  addSubtaskSchema,
  updateSubtaskSchema,
  reorderSubtasksSchema,
  addLinkAttachmentSchema,
  upsertMetaSchema,
  metaKeyParamSchema,
  type CreatePlanInput,
  type AddItemInput,
  type UpdateItemInput,
  type ReorderItemsInput,
  type AssignItemInput,
  type SetPeriodMarkInput,
  type BulkSetPeriodAcrossItemsInput,
  type BulkUpdateItemStatusInput,
  type BulkDeleteItemsInput,
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
  type AddSubtaskInput,
  type UpdateSubtaskInput,
  type ReorderSubtasksInput,
  type AddLinkAttachmentInput,
  type UpsertMetaInput,
  dashboardSummaryQuerySchema,
  importPlanItemsSchema,
  importPlanItemRowSchema,
  type DashboardSummaryQuery,
  type ImportPlanItemsInput,
  type ImportPlanItemRowInput,
} from "./schemas";

// Phase 4 — Audit & Insights domain types
export type { WorkProgressActivity } from "./domain/WorkProgressActivity";
export type { DashboardSummary } from "./application/use-cases/summary/getDashboardSummary";
export type {
  CustomerSummary,
  CategoryBreakdownRow,
} from "./application/ports/WorkProgressRepository";

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
  WorkProgressTemplateSubtask,
} from "./domain/WorkProgressTemplate";
export type { WorkProgressSubtask } from "./domain/WorkProgressSubtask";
export type {
  WorkProgressAttachment,
  AttachmentKind,
} from "./domain/WorkProgressAttachment";
export type {
  WorkProgressItemMeta,
  MetaValueType,
} from "./domain/WorkProgressItemMeta";
export type { PeriodTypeCode } from "./domain/types";
