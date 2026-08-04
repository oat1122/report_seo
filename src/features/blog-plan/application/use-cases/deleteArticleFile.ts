import { NotFoundError } from '@/lib/errors'
import type { BlogArticleRepository } from '../ports/BlogArticleRepository'
import type { BlogFileStorage } from '../ports/BlogFileStorage'

export function deleteArticleFileUseCase(
  articles: BlogArticleRepository,
  storage: BlogFileStorage,
) {
  return async (articleId: string, customerId: string, fileId: string): Promise<void> => {
    const article = await articles.findByIdForCustomer(articleId, customerId)
    if (!article) throw new NotFoundError('ไม่พบบทความ')

    const file = await articles.findFile(fileId, articleId)
    if (!file) throw new NotFoundError('ไม่พบไฟล์')

    await articles.deleteFile(fileId)
    await storage.removeByPublicUrl(file.url)
  }
}
