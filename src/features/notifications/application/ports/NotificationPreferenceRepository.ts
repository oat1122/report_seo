import type { NotificationPreference } from '../../domain/Notification'

export interface UpsertPreferenceData {
  type: string
  enabled: boolean
}

export interface NotificationPreferenceRepository {
  findByUserId(userId: string): Promise<NotificationPreference[]>
  findByUserAndType(userId: string, type: string): Promise<NotificationPreference | null>
  upsertMany(userId: string, items: UpsertPreferenceData[]): Promise<NotificationPreference[]>
}
