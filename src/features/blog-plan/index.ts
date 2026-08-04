// Public API ของ blog-plan feature
// route handler ต้อง import จากที่นี่เท่านั้น (presentation component import ผ่าน deep path
// ตาม convention เดียวกับ work-progress)

import { PrismaBlogArticleRepository } from './infrastructure/PrismaBlogArticleRepository'
import { PrismaBlogKeywordReader } from './infrastructure/PrismaBlogKeywordReader'
import { PrismaBlogSettingsRepository } from './infrastructure/PrismaBlogSettingsRepository'
import { LocalBlogFileStorage } from './infrastructure/LocalBlogFileStorage'

import { listArticlesUseCase } from './application/use-cases/listArticles'
import { createArticleUseCase } from './application/use-cases/createArticle'
import { updateArticleUseCase } from './application/use-cases/updateArticle'
import { deleteArticleUseCase } from './application/use-cases/deleteArticle'
import { updateStageUseCase } from './application/use-cases/updateStage'
import { submitClientFeedbackUseCase } from './application/use-cases/submitClientFeedback'
import { submitStageWorkUseCase } from './application/use-cases/submitStageWork'
import { deleteArticleFileUseCase } from './application/use-cases/deleteArticleFile'
import { listCustomerKeywordsUseCase } from './application/use-cases/listCustomerKeywords'
import {
  getBlogSettingsUseCase,
  updateBlogSettingsUseCase,
} from './application/use-cases/manageBlogSettings'

const articleRepository = new PrismaBlogArticleRepository()
const keywordReader = new PrismaBlogKeywordReader()
const settingsRepository = new PrismaBlogSettingsRepository()
const fileStorage = new LocalBlogFileStorage()

export const listArticles = listArticlesUseCase(articleRepository)
export const createArticle = createArticleUseCase(articleRepository)
export const updateArticle = updateArticleUseCase(articleRepository)
export const deleteArticle = deleteArticleUseCase(articleRepository, fileStorage)
export const updateStage = updateStageUseCase(articleRepository)
export const submitClientFeedback = submitClientFeedbackUseCase(articleRepository)
export const submitStageWork = submitStageWorkUseCase(articleRepository, fileStorage)
export const deleteArticleFile = deleteArticleFileUseCase(articleRepository, fileStorage)
export const listCustomerKeywords = listCustomerKeywordsUseCase(keywordReader, articleRepository)
export const getBlogSettings = getBlogSettingsUseCase(settingsRepository)
export const updateBlogSettings = updateBlogSettingsUseCase(settingsRepository)

export {
  BLOG_STAGE_CODES,
  listArticlesQuerySchema,
  createArticleSchema,
  updateArticleSchema,
  updateStageSchema,
  submitStageWorkSchema,
  submitFeedbackSchema,
  updateBlogSettingsSchema,
} from './schemas'

export { getStageLabel } from './domain/policies/article-status'
