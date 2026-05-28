import { withApiHandler, ok } from '@/infrastructure/http'
import { Role } from '@/types/auth'
import { getCustomerHubSummary } from '@/features/customer-hub'

export const GET = withApiHandler({ roles: [Role.CUSTOMER] }, async ({ session }) => {
  const summary = await getCustomerHubSummary(session.user.id)
  return ok(summary)
})
