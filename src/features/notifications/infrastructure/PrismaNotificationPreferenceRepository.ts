import { prisma } from '@/infrastructure/prisma/client'
import type { NotificationPreference } from '../domain/Notification'
import type {
  NotificationPreferenceRepository,
  UpsertPreferenceData,
} from '../application/ports/NotificationPreferenceRepository'

function toEntity(row: {
  id: string
  userId: string
  type: string
  enabled: boolean
}): NotificationPreference {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    enabled: row.enabled,
  }
}

export class PrismaNotificationPreferenceRepository implements NotificationPreferenceRepository {
  async findByUserId(userId: string): Promise<NotificationPreference[]> {
    const rows = await prisma.notificationPreference.findMany({
      where: { userId },
    })
    return rows.map(toEntity)
  }

  async findByUserAndType(userId: string, type: string): Promise<NotificationPreference | null> {
    const row = await prisma.notificationPreference.findUnique({
      where: { userId_type: { userId, type } },
    })
    return row ? toEntity(row) : null
  }

  async upsertMany(
    userId: string,
    items: UpsertPreferenceData[],
  ): Promise<NotificationPreference[]> {
    const results = await Promise.all(
      items.map((item) =>
        prisma.notificationPreference.upsert({
          where: { userId_type: { userId, type: item.type } },
          update: { enabled: item.enabled },
          create: { userId, type: item.type, enabled: item.enabled },
        }),
      ),
    )
    return results.map(toEntity)
  }
}
