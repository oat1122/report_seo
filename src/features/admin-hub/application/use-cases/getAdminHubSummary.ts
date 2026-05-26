import type { AdminHubRepository } from "../ports/AdminHubRepository";
import type { AdminHubSummary } from "../../domain/AdminHubSummary";

export function getAdminHubSummaryUseCase(repo: AdminHubRepository) {
  return async (): Promise<AdminHubSummary> => {
    return repo.getHubSummary();
  };
}
