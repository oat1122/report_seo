// pure TS — ห้าม import จาก @prisma/client / React / Next (rule 09)
// Audit trail event ของ plan (Phase 4)

export const ACTIVITY_ACTIONS = [
  "PLAN_CREATED",
  "PLAN_UPDATED",
  "PLAN_ARCHIVED",
  "PLAN_DELETED",
  "ITEM_CREATED",
  "ITEM_UPDATED",
  "ITEM_DELETED",
  "ITEM_REORDERED",
  "ITEM_ASSIGNED",
  "MARK_SET",
  "MARK_CLEARED",
  "MARK_BULK_SET",
  "SUBTASK_CREATED",
  "SUBTASK_UPDATED",
  "SUBTASK_TOGGLED",
  "SUBTASK_REORDERED",
  "SUBTASK_DELETED",
  "ATTACHMENT_UPLOADED",
  "ATTACHMENT_LINKED",
  "ATTACHMENT_DELETED",
  "META_UPSERTED",
  "META_BULK_UPSERTED",
  "META_DELETED",
] as const;

export type WorkProgressActivityAction = (typeof ACTIVITY_ACTIONS)[number];

export const ACTIVITY_ENTITIES = [
  "PLAN",
  "ITEM",
  "MARK",
  "SUBTASK",
  "ATTACHMENT",
  "META",
] as const;

export type WorkProgressActivityEntity = (typeof ACTIVITY_ENTITIES)[number];

// shape ของ diff field ที่ adapter เขียนลง DB (Json column)
// ทุก field optional — use case เลือกเก็บเฉพาะที่มีความหมาย
export interface WorkProgressActivityDiff {
  input?: unknown;
  after?: unknown;
  before?: unknown;
  entity?: unknown;
  // ฟิลด์ free-form — adapter cast เป็น Prisma.InputJsonValue
  [key: string]: unknown;
}

export interface WorkProgressActivity {
  id: string;
  planId: string;
  actorId: string | null;
  action: WorkProgressActivityAction;
  entity: WorkProgressActivityEntity;
  entityId: string | null;
  diff: WorkProgressActivityDiff | null;
  createdAt: Date;
}
