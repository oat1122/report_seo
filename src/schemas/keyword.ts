import { z } from "zod";
import { KdLevel } from "@/types/kd";

export const keywordSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  position: z.coerce.number().int().min(0).nullable().optional(),
  traffic: z.coerce.number().int().min(0),
  kd: z.enum(KdLevel),
  isTopReport: z.boolean(),
});

export type KeywordInput = z.infer<typeof keywordSchema>;
