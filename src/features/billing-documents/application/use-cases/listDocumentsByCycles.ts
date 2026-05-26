import type { BillingDocumentRepository } from "../ports/BillingDocumentRepository";
import type { BillingCycleProvider } from "../ports/BillingCycleProvider";

export function listDocumentsByCyclesUseCase(
  repo: BillingDocumentRepository,
  cycleProvider: BillingCycleProvider,
) {
  return async (customerId: string) => {
    const cycles = await cycleProvider.listCyclesByCustomer(customerId);
    if (cycles.length === 0) return [];

    const cycleIds = cycles.map((c) => c.id);
    return repo.listDocumentsByCycleIds(cycleIds);
  };
}
