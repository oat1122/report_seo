import { z } from "zod";

/**
 * Toggle visibility ของ history row(s) — รองรับทั้ง single และ bulk
 * Body ต้องมี historyId หรือ historyIds อย่างใดอย่างหนึ่ง
 */
export const historyVisibilitySchema = z
  .object({
    historyId: z.uuid().optional(),
    historyIds: z.array(z.uuid()).min(1).optional(),
    isVisible: z.boolean(),
  })
  .refine((d) => Boolean(d.historyId) !== Boolean(d.historyIds), {
    message: "ต้องระบุ historyId หรือ historyIds อย่างใดอย่างหนึ่ง",
    path: ["historyId"],
  });

export type HistoryVisibilityInput = z.infer<typeof historyVisibilitySchema>;
