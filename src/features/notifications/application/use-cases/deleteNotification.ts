import type { NotificationRepository } from '../ports/NotificationRepository'
import { NotFoundError } from '@/lib/errors'

export function deleteNotificationUseCase(repo: NotificationRepository) {
  return async (userId: string, notificationId: string): Promise<void> => {
    const notification = await repo.findById(notificationId, userId)
    if (!notification) throw new NotFoundError('Notification not found')
    await repo.delete(notificationId, userId)
  }
}
