import type { RecommendationRepository } from "../ports/RecommendationRepository";

export function deleteRecommendationUseCase(repo: RecommendationRepository) {
  return (recommendId: string) => repo.delete(recommendId);
}
