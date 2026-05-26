import type { NotificationPreferenceRepository } from "../ports/NotificationPreferenceRepository";
import type { NotificationPreference } from "../../domain/Notification";

export interface UpdatePreferencesInput {
  items: Array<{ type: string; enabled: boolean }>;
}

export function updatePreferencesUseCase(
  prefRepo: NotificationPreferenceRepository,
) {
  return async (
    userId: string,
    input: UpdatePreferencesInput,
  ): Promise<NotificationPreference[]> => {
    return prefRepo.upsertMany(userId, input.items);
  };
}
