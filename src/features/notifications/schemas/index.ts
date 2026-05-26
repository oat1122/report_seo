import { z } from "zod";
import { paginationQuerySchema } from "@/lib/pagination";

export const listNotificationsQuerySchema = paginationQuerySchema.extend({
  unreadOnly: z.coerce.boolean().optional().default(false),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;

export const notificationIdParamSchema = z.object({
  id: z.uuid(),
});

export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>;

export const updatePreferencesSchema = z.object({
  items: z
    .array(
      z.object({
        type: z.string().min(1),
        enabled: z.boolean(),
      }),
    )
    .min(1),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

export const createNotificationSchema = z.object({
  type: z.string().min(1),
  recipientUserIds: z.array(z.uuid()).min(1),
  actorId: z.uuid().optional(),
  title: z.string().min(1).max(200),
  body: z.string().max(2000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
