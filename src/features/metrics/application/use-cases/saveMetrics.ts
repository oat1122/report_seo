import { metricsSchema } from "../../schemas";
import { BadRequestError } from "@/lib/errors";
import type { MetricsRepository } from "../ports/MetricsRepository";

export function saveMetricsUseCase(repo: MetricsRepository) {
  return async (customerInternalId: string, raw: unknown) => {
    const parsed = metricsSchema.safeParse(raw);
    if (!parsed.success) {
      const detail = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join(", ");
      throw new BadRequestError(`Invalid data: ${detail}`);
    }
    return repo.upsert(customerInternalId, parsed.data);
  };
}
