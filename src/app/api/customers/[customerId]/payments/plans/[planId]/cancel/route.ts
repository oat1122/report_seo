import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok } from '@/infrastructure/http'
import { cancelPaymentPlan } from '@/features/payments'

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
})

export const POST = withApiHandler({ params: paramsSchema }, async ({ params }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')
  return ok(await cancelPaymentPlan(ctx.customer.id, params.planId))
})
