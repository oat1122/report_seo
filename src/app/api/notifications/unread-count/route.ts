import { withApiHandler, ok } from '@/infrastructure/http'
import { getUnreadCount } from '@/features/notifications'

export const GET = withApiHandler({}, async ({ session }) => {
  const count = await getUnreadCount(session.user.id)
  return ok({ count })
})
