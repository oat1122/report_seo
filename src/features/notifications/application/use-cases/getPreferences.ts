import type { NotificationPreferenceRepository } from '../ports/NotificationPreferenceRepository'
import type { NotificationPreference } from '../../domain/Notification'
import { NOTIFICATION_TYPES, type NotificationType } from '../../domain/NotificationTypes'

export interface PreferenceWithLabel {
  type: NotificationType
  enabled: boolean
}

export function getPreferencesUseCase(prefRepo: NotificationPreferenceRepository) {
  return async (userId: string): Promise<PreferenceWithLabel[]> => {
    const existing = await prefRepo.findByUserId(userId)
    const map = new Map<string, NotificationPreference>()
    for (const p of existing) {
      map.set(p.type, p)
    }

    const allTypes = Object.values(NOTIFICATION_TYPES) as NotificationType[]
    return allTypes.map((type) => ({
      type,
      enabled: map.get(type)?.enabled ?? true,
    }))
  }
}
