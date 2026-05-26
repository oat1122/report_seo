import type { NotificationRepository } from "../ports/NotificationRepository";
import { NotFoundError } from "@/lib/errors";

export function markAsReadUseCase(repo: NotificationRepository) {
  return async (userId: string, notificationId: string): Promise<void> => {
    const notification = await repo.findById(notificationId, userId);
    if (!notification) throw new NotFoundError("Notification not found");
    if (notification.isRead) return;
    await repo.markRead(notificationId, userId);
  };
}
