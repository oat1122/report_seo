import type { RecommendationRepository } from "../ports/RecommendationRepository";

export function listRecommendationsUseCase(repo: RecommendationRepository) {
  return (customerInternalId: string) =>
    repo.findByCustomerId(customerInternalId);
}
