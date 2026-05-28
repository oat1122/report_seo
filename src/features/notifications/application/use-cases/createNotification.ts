import type { NotificationRepository } from '../ports/NotificationRepository'
import type { NotificationPreferenceRepository } from '../ports/NotificationPreferenceRepository'
import type { NotificationEmitter } from '../ports/NotificationEmitter'

export interface CreateNotificationInput {
  type: string
  recipientUserIds: string[]
  actorId?: string
  title: string
  body?: string
  metadata?: Record<string, unknown>
}

export function createNotificationUseCase(
  repo: NotificationRepository,
  prefRepo: NotificationPreferenceRepository,
  emitter: NotificationEmitter,
) {
  return async (input: CreateNotificationInput): Promise<void> => {
    for (const userId of input.recipientUserIds) {
      // skip ถ้า actor คือ recipient เอง
      if (input.actorId && input.actorId === userId) continue

      const pref = await prefRepo.findByUserAndType(userId, input.type)
      if (pref && !pref.enabled) continue

      const notification = await repo.save({
        userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        metadata: input.metadata ?? null,
        actorId: input.actorId ?? null,
      })

      emitter.emitToUser(userId, notification)
    }
  }
}
