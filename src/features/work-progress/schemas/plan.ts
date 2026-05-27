import { z } from "zod";
import { WorkProgressPeriodType } from "@prisma/client";

export const customPeriodSchema = z.object({
  label: z.string().min(1).max(50),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

const monthRangeFields = {
  startMonth: z.number().int().min(1).max(12).optional(),
  startYear: z.number().int().min(2020).max(2099).optional(),
  endMonth: z.number().int().min(1).max(12).optional(),
  endYear: z.number().int().min(2020).max(2099).optional(),
};

export const createPlanSchema = z
  .object({
    title: z.string().min(1).max(200),
    periodType: z
      .nativeEnum(WorkProgressPeriodType)
      .default(WorkProgressPeriodType.YEAR_12_MONTHS),
    year: z.number().int().min(2020).max(2099).optional(),
    ...monthRangeFields,
    customPeriods: z.array(customPeriodSchema).optional(),
    packageName: z.string().max(200).optional().nullable(),
    note: z.string().max(5000).optional().nullable(),
    templateId: z.string().uuid().optional(),
    cloneFromPlanId: z.string().uuid().optional(),
  })
  .refine(
    (d) =>
      d.periodType !== WorkProgressPeriodType.CUSTOM ||
      (d.customPeriods?.length ?? 0) > 0,
    {
      message: "CUSTOM periodType ต้องระบุ customPeriods อย่างน้อย 1 รายการ",
      path: ["customPeriods"],
    },
  )
  .refine((d) => !(d.templateId && d.cloneFromPlanId), {
    message: "templateId กับ cloneFromPlanId ต้องเลือกอย่างใดอย่างหนึ่ง",
    path: ["templateId"],
  })
  .refine(
    (d) => {
      // monthRange ต้องครบทั้ง 4 ฟิลด์หรือไม่มีเลย
      const filled = [d.startMonth, d.startYear, d.endMonth, d.endYear].filter(
        (v) => v !== undefined,
      ).length;
      return filled === 0 || filled === 4;
    },
    {
      message:
        "ระบุช่วงเดือนต้องครบทั้ง 4 ค่า (startMonth, startYear, endMonth, endYear)",
      path: ["startMonth"],
    },
  )
  .refine(
    (d) => {
      if (
        d.startMonth === undefined ||
        d.startYear === undefined ||
        d.endMonth === undefined ||
        d.endYear === undefined
      )
        return true;
      const startIdx = d.startYear * 12 + (d.startMonth - 1);
      const endIdx = d.endYear * 12 + (d.endMonth - 1);
      return endIdx >= startIdx;
    },
    {
      message: "เดือนจบต้องไม่อยู่ก่อนเดือนเริ่ม",
      path: ["endMonth"],
    },
  );

export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const updatePlanSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    ...monthRangeFields,
    packageName: z.string().max(200).optional().nullable(),
    note: z.string().max(5000).optional().nullable(),
  })
  .refine(
    (d) => {
      const filled = [d.startMonth, d.startYear, d.endMonth, d.endYear].filter(
        (v) => v !== undefined,
      ).length;
      return filled === 0 || filled === 4;
    },
    {
      message:
        "ระบุช่วงเดือนต้องครบทั้ง 4 ค่า (startMonth, startYear, endMonth, endYear)",
      path: ["startMonth"],
    },
  )
  .refine(
    (d) => {
      if (
        d.startMonth === undefined ||
        d.startYear === undefined ||
        d.endMonth === undefined ||
        d.endYear === undefined
      )
        return true;
      const startIdx = d.startYear * 12 + (d.startMonth - 1);
      const endIdx = d.endYear * 12 + (d.endMonth - 1);
      return endIdx >= startIdx;
    },
    {
      message: "เดือนจบต้องไม่อยู่ก่อนเดือนเริ่ม",
      path: ["endMonth"],
    },
  );

export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;

export const listPlansQuerySchema = z.object({
  includeArchived: z.coerce.boolean().optional().default(false),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export type ListPlansQuery = z.infer<typeof listPlansQuerySchema>;
