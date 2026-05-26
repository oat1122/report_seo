import type { NotificationRepository } from "../ports/NotificationRepository";

export function getUnreadCountUseCase(repo: NotificationRepository) {
  return async (userId: string): Promise<number> => {
    return repo.countUnread(userId);
  };
}
