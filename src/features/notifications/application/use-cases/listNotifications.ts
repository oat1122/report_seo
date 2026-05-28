import type {
  NotificationRepository,
  ListNotificationsResult,
} from '../ports/NotificationRepository'

export interface ListNotificationsInput {
  userId: string
  unreadOnly?: boolean
  page: number
  limit: number
}

export function listNotificationsUseCase(repo: NotificationRepository) {
  return async (input: ListNotificationsInput): Promise<ListNotificationsResult> => {
    return repo.findByUserId({
      userId: input.userId,
      unreadOnly: input.unreadOnly,
      page: input.page,
      limit: input.limit,
    })
  }
}
