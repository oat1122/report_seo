import { PrismaNotificationRepository } from "./infrastructure/PrismaNotificationRepository";
import { PrismaNotificationPreferenceRepository } from "./infrastructure/PrismaNotificationPreferenceRepository";
import { SocketIoNotificationEmitter } from "./infrastructure/SocketIoNotificationEmitter";

import { createNotificationUseCase } from "./application/use-cases/createNotification";
import { listNotificationsUseCase } from "./application/use-cases/listNotifications";
import { getUnreadCountUseCase } from "./application/use-cases/getUnreadCount";
import { markAsReadUseCase } from "./application/use-cases/markAsRead";
import { markAllAsReadUseCase } from "./application/use-cases/markAllAsRead";
import { deleteNotificationUseCase } from "./application/use-cases/deleteNotification";
import { getPreferencesUseCase } from "./application/use-cases/getPreferences";
import { updatePreferencesUseCase } from "./application/use-cases/updatePreferences";

const notifRepo = new PrismaNotificationRepository();
const prefRepo = new PrismaNotificationPreferenceRepository();
const emitter = new SocketIoNotificationEmitter();

export const createNotification = createNotificationUseCase(
  notifRepo,
  prefRepo,
  emitter,
);
export const listNotifications = listNotificationsUseCase(notifRepo);
export const getUnreadCount = getUnreadCountUseCase(notifRepo);
export const markAsRead = markAsReadUseCase(notifRepo);
export const markAllAsRead = markAllAsReadUseCase(notifRepo);
export const deleteNotification = deleteNotificationUseCase(notifRepo);
export const getPreferences = getPreferencesUseCase(prefRepo);
export const updatePreferences = updatePreferencesUseCase(prefRepo);

export {
  listNotificationsQuerySchema,
  notificationIdParamSchema,
  updatePreferencesSchema,
  createNotificationSchema,
  type ListNotificationsQuery,
  type NotificationIdParam,
  type UpdatePreferencesInput,
  type CreateNotificationInput,
} from "./schemas";

export type { Notification, NotificationPreference } from "./domain/Notification";
export {
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_GROUPS,
  type NotificationType,
} from "./domain/NotificationTypes";
export type { PreferenceWithLabel } from "./application/use-cases/getPreferences";

export { NotificationBell } from "./presentation/components/NotificationBell";
export { NotificationSocketInit } from "./presentation/components/NotificationSocketInit";
