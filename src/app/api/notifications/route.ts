import { withApiHandler, okPaginated } from '@/infrastructure/http'
import { listNotifications, listNotificationsQuerySchema } from '@/features/notifications'

export const GET = withApiHandler(
  { query: listNotificationsQuerySchema },
  async ({ session, query }) => {
    const result = await listNotifications({
      userId: session.user.id,
      unreadOnly: query.unreadOnly,
      page: query.page,
      limit: query.limit,
    })
    return okPaginated(result.items, {
      page: query.page,
      limit: query.limit,
      total: result.total,
    })
  },
)
