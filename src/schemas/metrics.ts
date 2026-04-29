import { z } from "zod";

// ทุก field optional — service ทำ upsert: update รับ partial (เฉพาะ field ที่ส่งมา),
// create จะ fail ที่ Prisma level ถ้ายังไม่มี row + ส่งฟิลด์ไม่ครบ → error bubbles to client
export const metricsSchema = z.object({
  domainRating: z.coerce.number().int().min(0).max(100).optional(),
  healthScore: z.coerce.number().int().min(0).max(100).optional(),
  ageInYears: z.coerce.number().int().min(0).optional(),
  ageInMonths: z.coerce.number().int().min(0).max(11).optional(),
  // spamScore รับทศนิยมได้ (เช่น 0.1) — ตรงกับ Prisma Float
  spamScore: z.coerce.number().min(0).max(100).optional(),
  organicTraffic: z.coerce.number().int().min(0).optional(),
  organicKeywords: z.coerce.number().int().min(0).optional(),
  backlinks: z.coerce.number().int().min(0).optional(),
  refDomains: z.coerce.number().int().min(0).optional(),
});

export type MetricsInput = z.infer<typeof metricsSchema>;
