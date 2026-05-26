import type { CustomerHubSummary } from "../../domain/CustomerHubSummary";

export interface CustomerHubRepository {
  getHubSummary(userId: string): Promise<CustomerHubSummary>;
}
