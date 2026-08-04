import { NotFoundError } from '@/lib/errors'
import type { BlogArticleRepository } from '../ports/BlogArticleRepository'
import type { BlogFileStorage } from '../ports/BlogFileStorage'

export function deleteArticleUseCase(articles: BlogArticleRepository, storage: BlogFileStorage) {
  return async (articleId: string, customerId: string): Promise<void> => {
    const existing = await articles.findByIdForCustomer(articleId, customerId)
    if (!existing) throw new NotFoundError('ไม่พบบทความ')

    // ลบไฟล์บนดิสก์ก่อน — cascade ของ Prisma ลบแค่แถวใน DB
    await Promise.all(existing.files.map((file) => storage.removeByPublicUrl(file.url)))
    await articles.delete(articleId)
  }
}
