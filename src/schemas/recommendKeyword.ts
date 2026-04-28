import { z } from "zod";
import { KdLevel } from "@/types/kd";

export const recommendKeywordSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  kd: z.enum(KdLevel).nullable().optional(),
  isTopReport: z.boolean().optional(),
  note: z.string().nullable().optional(),
});

export type RecommendKeywordInput = z.infer<typeof recommendKeywordSchema>;

// แปลง note ที่ user ส่งมา → null (รองรับทั้ง undefined, "", "  ")
export function normalizeNote(
  note: string | null | undefined,
): string | null {
  if (note == null) return null;
  const trimmed = note.trim();
  return trimmed === "" ? null : trimmed;
}
