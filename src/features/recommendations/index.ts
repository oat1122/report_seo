import { PrismaRecommendationRepository } from './infrastructure/PrismaRecommendationRepository'
import { listRecommendationsUseCase } from './application/use-cases/listRecommendations'
import { addRecommendationUseCase } from './application/use-cases/addRecommendation'
import { updateRecommendationUseCase } from './application/use-cases/updateRecommendation'
import { deleteRecommendationUseCase } from './application/use-cases/deleteRecommendation'

const repo = new PrismaRecommendationRepository()

export const listRecommendations = listRecommendationsUseCase(repo)
export const addRecommendation = addRecommendationUseCase(repo)
export const updateRecommendation = updateRecommendationUseCase(repo)
export const deleteRecommendation = deleteRecommendationUseCase(repo)

export { recommendKeywordSchema, normalizeNote, type RecommendKeywordInput } from './schemas'
export type { KeywordRecommend } from './domain/KeywordRecommend'
