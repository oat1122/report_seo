import { z } from "zod";

export const setPeriodMarkSchema = z.object({
  periodId: z.string().uuid(),
  markTypeId: z.string().uuid(),
  progressPercent: z.number().int().min(0).max(100).optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
});

export type SetPeriodMarkInput = z.infer<typeof setPeriodMarkSchema>;

export const bulkSetPeriodMarksSchema = z.object({
  marks: z
    .array(
      z.object({
        periodId: z.string().uuid(),
        markTypeId: z.string().uuid(),
        progressPercent: z.number().int().min(0).max(100).optional().nullable(),
        note: z.string().max(2000).optional().nullable(),
      }),
    )
    .min(1)
    .max(100),
});

export type BulkSetPeriodMarksInput = z.infer<typeof bulkSetPeriodMarksSchema>;
