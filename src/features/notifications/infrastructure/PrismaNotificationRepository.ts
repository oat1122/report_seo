import { prisma } from '@/infrastructure/prisma/client'
import type { Notification } from '../domain/Notification'
import type {
  NotificationRepository,
  CreateNotificationData,
  ListNotificationsQuery,
  ListNotificationsResult,
} from '../application/ports/NotificationRepository'

function toEntity(row: {
  id: string
  userId: string
  type: string
  title: string
  body: string | null
  isRead: boolean
  readAt: Date | null
  metadata: unknown
  actorId: string | null
  actor?: { name: string | null } | null
  createdAt: Date
}): Notification {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    title: row.title,
    body: row.body,
    isRead: row.isRead,
    readAt: row.readAt,
    metadata: (row.metadata as Record<string, unknown>) ?? null,
    actorId: row.actorId,
    actorName: row.actor?.name ?? null,
    createdAt: row.createdAt,
  }
}

const actorSelect = { select: { name: true } } as const

export class PrismaNotificationRepository implements NotificationRepository {
  async save(data: CreateNotificationData): Promise<Notification> {
    const row = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body ?? null,
        metadata: data.metadata ?? undefined,
        actorId: data.actorId ?? null,
      },
      include: { actor: actorSelect },
    })
    return toEntity(row)
  }

  async findById(id: string, userId: string): Promise<Notification | null> {
    const row = await prisma.notification.findFirst({
      where: { id, userId },
      include: { actor: actorSelect },
    })
    return row ? toEntity(row) : null
  }

  async findByUserId(query: ListNotificationsQuery): Promise<ListNotificationsResult> {
    const where = {
      userId: query.userId,
      ...(query.unreadOnly ? { isRead: false } : {}),
    }

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: { actor: actorSelect },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.notification.count({ where }),
    ])

    return { items: items.map(toEntity), total }
  }

  async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    })
  }

  async markRead(id: string, userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    })
  }

  async markAllRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })
    return result.count
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.notification.deleteMany({
      where: { id, userId },
    })
  }
}
