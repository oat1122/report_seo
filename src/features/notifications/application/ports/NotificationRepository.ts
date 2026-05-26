import type { Notification } from "../../domain/Notification";

export interface CreateNotificationData {
  userId: string;
  type: string;
  title: string;
  body?: string | null;
  metadata?: Record<string, unknown> | null;
  actorId?: string | null;
}

export interface ListNotificationsQuery {
  userId: string;
  unreadOnly?: boolean;
  page: number;
  limit: number;
}

export interface ListNotificationsResult {
  items: Notification[];
  total: number;
}

export interface NotificationRepository {
  save(data: CreateNotificationData): Promise<Notification>;
  findById(id: string, userId: string): Promise<Notification | null>;
  findByUserId(query: ListNotificationsQuery): Promise<ListNotificationsResult>;
  countUnread(userId: string): Promise<number>;
  markRead(id: string, userId: string): Promise<void>;
  markAllRead(userId: string): Promise<number>;
  delete(id: string, userId: string): Promise<void>;
}
