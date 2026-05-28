import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok } from '@/infrastructure/http'
import { getCustomerReport } from '@/features/customer-report'

const paramsSchema = z.object({ customerId: z.uuid() })

export const GET = withApiHandler({ params: paramsSchema }, async ({ params }) => {
  await customerAccessGuard({ byUserId: params.customerId }, 'read')
  return ok(await getCustomerReport(params.customerId))
})
