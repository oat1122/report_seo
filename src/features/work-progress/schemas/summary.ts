import { z } from "zod";

export const dashboardSummaryQuerySchema = z.object({
  upcomingDays: z.coerce.number().int().min(1).max(60).default(14),
  recentLimit: z.coerce.number().int().min(0).max(20).default(5),
});

export type DashboardSummaryQuery = z.infer<typeof dashboardSummaryQuerySchema>;

export const categoryBreakdownQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
});

export type CategoryBreakdownQuery = z.infer<typeof categoryBreakdownQuerySchema>;
