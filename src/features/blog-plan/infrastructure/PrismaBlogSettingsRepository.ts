import { prisma } from '@/infrastructure/prisma/client'
import { Role } from '@/types/auth'
import type {
  BlogSettings,
  BlogSettingsPatch,
  BlogSettingsRepository,
} from '../application/ports/BlogSettingsRepository'

const settingsSelect = {
  articlesPerMonth: true,
  blogWriterId: true,
  blogRequiresApproval: true,
  blogWriter: { select: { name: true } },
} as const

function toSettings(row: {
  articlesPerMonth: number
  blogWriterId: string | null
  blogRequiresApproval: boolean
  blogWriter: { name: string | null } | null
}): BlogSettings {
  return {
    articlesPerMonth: row.articlesPerMonth,
    blogWriterId: row.blogWriterId,
    blogWriterName: row.blogWriter?.name ?? null,
    blogRequiresApproval: row.blogRequiresApproval,
  }
}

export class PrismaBlogSettingsRepository implements BlogSettingsRepository {
  async get(customerId: string): Promise<BlogSettings | null> {
    const row = await prisma.customer.findUnique({
      where: { id: customerId },
      select: settingsSelect,
    })
    return row ? toSettings(row) : null
  }

  async update(customerId: string, patch: BlogSettingsPatch): Promise<BlogSettings> {
    const row = await prisma.customer.update({
      where: { id: customerId },
      data: patch,
      select: settingsSelect,
    })
    return toSettings(row)
  }

  async isBlogWriter(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
    return user?.role === Role.BLOG_WRITER
  }
}
