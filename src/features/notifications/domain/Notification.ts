export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  body: string | null
  isRead: boolean
  readAt: Date | null
  metadata: Record<string, unknown> | null
  actorId: string | null
  actorName: string | null
  createdAt: Date
}

export interface NotificationPreference {
  id: string
  userId: string
  type: string
  enabled: boolean
}
