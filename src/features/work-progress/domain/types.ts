// pure TS — ห้าม import จาก @prisma/client (rule 09)
// mirror enum WorkProgressPeriodType ใน Prisma → string union เพื่อให้ domain ใช้ได้โดยไม่ผูก runtime
export type PeriodTypeCode =
  | "YEAR_12_MONTHS"
  | "YEAR_4_QUARTERS"
  | "HALF_2_PERIODS"
  | "CUSTOM";

// master code (string) — domain ไม่รู้รายการ จริง ๆ ทั้งหมดอยู่ใน DB
export type StatusCode = string;
export type CategoryCode = string;
export type MarkCode = string;
