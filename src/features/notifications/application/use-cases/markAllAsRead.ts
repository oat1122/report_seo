import type { NotificationRepository } from '../ports/NotificationRepository'

export function markAllAsReadUseCase(repo: NotificationRepository) {
  return async (userId: string): Promise<number> => {
    return repo.markAllRead(userId)
  }
}
