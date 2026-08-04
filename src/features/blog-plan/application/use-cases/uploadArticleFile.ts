import { NotFoundError } from '@/lib/errors'
import type { BlogFileKind } from '../../domain/BlogArticle'
import type { BlogArticleRepository } from '../ports/BlogArticleRepository'
import type { BlogFileStorage } from '../ports/BlogFileStorage'

export function uploadArticleFileUseCase(
  articles: BlogArticleRepository,
  storage: BlogFileStorage,
) {
  return async (
    articleId: string,
    customerId: string,
    file: File,
    kind: BlogFileKind,
    uploadedById: string | null,
  ): Promise<{ url: string; version: number }> => {
    const article = await articles.findByIdForCustomer(articleId, customerId)
    if (!article) throw new NotFoundError('ไม่พบบทความ')

    const saved = await storage.validateAndWrite(file, kind)

    try {
      const version = await articles.addFile(articleId, {
        kind,
        url: saved.url,
        filename: saved.filename,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
        uploadedById,
      })
      return { url: saved.url, version }
    } catch (error) {
      await storage.removeByAbsolutePath(saved.absolutePath)
      throw error
    }
  }
}
