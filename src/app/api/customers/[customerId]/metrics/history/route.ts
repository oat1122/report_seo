import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok } from '@/infrastructure/http'
import { getCustomerHistoryReport } from '@/features/customer-report'

const paramsSchema = z.object({ customerId: z.uuid() })

export const GET = withApiHandler({ params: paramsSchema }, async ({ params }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'read')
  const history = await getCustomerHistoryReport(ctx.customer.id, {
    onlyVisible: !ctx.canManage,
  })
  return ok(history)
})
