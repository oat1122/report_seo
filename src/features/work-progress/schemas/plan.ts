import { z } from "zod";
import { WorkProgressPeriodType } from "@prisma/client";

export const customPeriodSchema = z.object({
  label: z.string().min(1).max(50),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const createPlanSchema = z
  .object({
    title: z.string().min(1).max(200),
    periodType: z
      .nativeEnum(WorkProgressPeriodType)
      .default(WorkProgressPeriodType.YEAR_12_MONTHS),
    year: z.number().int().min(2020).max(2099).optional(),
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
  });

export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const listPlansQuerySchema = z.object({
  includeArchived: z.coerce.boolean().optional().default(false),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export type ListPlansQuery = z.infer<typeof listPlansQuerySchema>;
