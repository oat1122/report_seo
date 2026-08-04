import { BadRequestError, NotFoundError } from '@/lib/errors'
import type { BlogSettings, BlogSettingsRepository } from '../ports/BlogSettingsRepository'
import type { UpdateBlogSettingsInput } from '../../schemas'

export function getBlogSettingsUseCase(settings: BlogSettingsRepository) {
  return async (customerId: string): Promise<BlogSettings> => {
    const found = await settings.get(customerId)
    if (!found) throw new NotFoundError('ไม่พบลูกค้า')
    return found
  }
}

export function updateBlogSettingsUseCase(settings: BlogSettingsRepository) {
  return async (customerId: string, input: UpdateBlogSettingsInput): Promise<BlogSettings> => {
    if (input.blogWriterId) {
      const isWriter = await settings.isBlogWriter(input.blogWriterId)
      if (!isWriter) throw new BadRequestError('ผู้ใช้ที่เลือกไม่ใช่ Blog Writer')
    }
    return settings.update(customerId, input)
  }
}
