import { getSocketServer } from '@/infrastructure/socket/server'
import type { NotificationEmitter } from '../application/ports/NotificationEmitter'
import type { Notification } from '../domain/Notification'

export class SocketIoNotificationEmitter implements NotificationEmitter {
  emitToUser(userId: string, notification: Notification): void {
    const io = getSocketServer()
    if (io) {
      io.to(`user:${userId}`).emit('notification:new', notification)
    }
  }
}
