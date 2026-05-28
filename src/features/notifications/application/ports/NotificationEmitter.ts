import type { Notification } from '../../domain/Notification'

export interface NotificationEmitter {
  emitToUser(userId: string, notification: Notification): void
}
