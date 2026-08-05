import { BadRequestError, NotFoundError } from '@/lib/errors'
import type { BlogSettingsRepository } from '../ports/BlogSettingsRepository'

export interface MessageWriterTarget {
  blogWriterId: string
  blogWriterName: string | null
}

/**
 * เตรียมปลายทางของข้อความที่ลูกค้าทักไปหาทีมเขียน
 * ตัวส่ง notification อยู่ที่ route handler (pattern เดียวกับ feedback route)
 */
export function messageBlogWriterUseCase(settings: BlogSettingsRepository) {
  return async (customerId: string): Promise<MessageWriterTarget> => {
    const found = await settings.get(customerId)
    if (!found) throw new NotFoundError('ไม่พบลูกค้า')
    if (!found.blogWriterId) {
      throw new BadRequestError('ยังไม่มีทีมเขียนที่ดูแลบทความของคุณ กรุณาติดต่อผู้ดูแลระบบ')
    }

    return { blogWriterId: found.blogWriterId, blogWriterName: found.blogWriterName }
  }
}
