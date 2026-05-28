import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok } from '@/infrastructure/http'
import { listBillingCycles } from '@/features/payments'

const paramsSchema = z.object({ customerId: z.string().uuid() })

export const GET = withApiHandler({ params: paramsSchema }, async ({ params }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'read')
  return ok(await listBillingCycles(ctx.customer.id))
})
