import type { AdminHubSummary } from "../../domain/AdminHubSummary";

export interface AdminHubRepository {
  getHubSummary(): Promise<AdminHubSummary>;
}
