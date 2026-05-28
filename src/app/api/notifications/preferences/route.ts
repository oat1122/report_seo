import { withApiHandler, ok } from '@/infrastructure/http'
import {
  getPreferences,
  updatePreferences,
  updatePreferencesSchema,
} from '@/features/notifications'

export const GET = withApiHandler({}, async ({ session }) => {
  const prefs = await getPreferences(session.user.id)
  return ok(prefs)
})

export const PUT = withApiHandler({ body: updatePreferencesSchema }, async ({ session, body }) => {
  const updated = await updatePreferences(session.user.id, body)
  return ok(updated)
})
