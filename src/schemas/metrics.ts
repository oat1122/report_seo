import { z } from "zod";

export const metricsSchema = z.object({
  domainRating: z.coerce.number().int().min(0).max(100),
  healthScore: z.coerce.number().int().min(0).max(100),
  ageInYears: z.coerce.number().int().min(0),
  ageInMonths: z.coerce.number().int().min(0).max(11).default(0),
  spamScore: z.coerce.number().int().min(0).max(100),
  organicTraffic: z.coerce.number().int().min(0),
  organicKeywords: z.coerce.number().int().min(0),
  backlinks: z.coerce.number().int().min(0),
  refDomains: z.coerce.number().int().min(0),
});

export type MetricsInput = z.infer<typeof metricsSchema>;
