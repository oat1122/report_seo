import { withApiHandler, ok } from '@/infrastructure/http'
import { markAsRead, notificationIdParamSchema } from '@/features/notifications'

export const PATCH = withApiHandler(
  { params: notificationIdParamSchema },
  async ({ session, params }) => {
    await markAsRead(session.user.id, params.id)
    return ok({ success: true })
  },
)
