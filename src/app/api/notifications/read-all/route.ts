import { withApiHandler, ok } from '@/infrastructure/http'
import { markAllAsRead } from '@/features/notifications'

export const PATCH = withApiHandler({}, async ({ session }) => {
  const count = await markAllAsRead(session.user.id)
  return ok({ updated: count })
})
