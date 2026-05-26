import type { CustomerHubRepository } from "../ports/CustomerHubRepository";
import type { CustomerHubSummary } from "../../domain/CustomerHubSummary";

export function getCustomerHubSummaryUseCase(repo: CustomerHubRepository) {
  return async (userId: string): Promise<CustomerHubSummary> => {
    return repo.getHubSummary(userId);
  };
}
