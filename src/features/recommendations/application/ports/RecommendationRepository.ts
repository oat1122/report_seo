import type { KeywordRecommend } from "../../domain/KeywordRecommend";
import type { RecommendKeywordInput } from "../../schemas";

export interface RecommendationRepository {
  findByCustomerId(customerInternalId: string): Promise<KeywordRecommend[]>;
  create(
    customerInternalId: string,
    data: RecommendKeywordInput & { note: string | null },
  ): Promise<KeywordRecommend>;
  update(
    recommendId: string,
    data: RecommendKeywordInput & { note: string | null },
  ): Promise<KeywordRecommend>;
  delete(recommendId: string): Promise<void>;
}
