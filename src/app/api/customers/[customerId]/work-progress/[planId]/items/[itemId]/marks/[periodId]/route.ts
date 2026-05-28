import { z } from 'zod'
import { withApiHandler, customerAccessGuard, noContent } from '@/infrastructure/http'
import { clearPeriodMark } from '@/features/work-progress'

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  itemId: z.string().uuid(),
  periodId: z.string().uuid(),
})

export const DELETE = withApiHandler({ params: paramsSchema }, async ({ params, session }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')
  await clearPeriodMark(
    ctx.customer.id,
    params.planId,
    params.itemId,
    params.periodId,
    session.user.id,
  )
  return noContent()
})
