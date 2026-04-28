import { z } from "zod";

export const aiOverviewCreateSchema = z.object({
  title: z.string().trim().min(1, "กรุณาระบุหัวข้อ AI Overview"),
  displayDate: z.coerce.date().optional(),
});

export type AiOverviewCreateInput = z.infer<typeof aiOverviewCreateSchema>;

export const aiOverviewUpdateSchema = z.object({
  title: z.string().trim().min(1, "กรุณาระบุหัวข้อ AI Overview"),
  displayDate: z.coerce.date().optional(),
});

export type AiOverviewUpdateInput = z.infer<typeof aiOverviewUpdateSchema>;

export const imagesToDeleteSchema = z.array(z.string().uuid());

export const MAX_AI_OVERVIEW_IMAGES = 3;
