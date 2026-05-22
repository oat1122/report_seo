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

// Phase 6 — bulk set period N across multiple items
export const bulkSetPeriodAcrossItemsSchema = z.object({
  periodId: z.string().uuid(),
  itemIds: z.array(z.string().uuid()).min(1).max(200),
  markTypeId: z.string().uuid().nullable(),
  progressPercent: z.number().int().min(0).max(100).optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
});

export type BulkSetPeriodAcrossItemsInput = z.infer<
  typeof bulkSetPeriodAcrossItemsSchema
>;
