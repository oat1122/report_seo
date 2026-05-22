import { z } from "zod";

export const importPlanItemRowSchema = z.object({
  categoryCode: z.string().min(1).max(100),
  activity: z.string().min(1).max(2000),
  statusCode: z.string().max(100).optional().nullable(),
  duration: z.string().max(100).optional().nullable(),
  weight: z.coerce.number().int().min(1).max(100).optional().default(1),
  description: z.string().max(5000).optional().nullable(),
  note: z.string().max(5000).optional().nullable(),
});

export type ImportPlanItemRowInput = z.infer<typeof importPlanItemRowSchema>;

export const importPlanItemsSchema = z.object({
  rows: z.array(importPlanItemRowSchema).min(1).max(500),
});

export type ImportPlanItemsInput = z.infer<typeof importPlanItemsSchema>;
