import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok } from '@/infrastructure/http'
import { dashboardSummaryQuerySchema, getDashboardSummary } from '@/features/work-progress'

const paramsSchema = z.object({ customerId: z.string().uuid() })

export const GET = withApiHandler(
  { params: paramsSchema, query: dashboardSummaryQuerySchema },
  async ({ params, query }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'read')
    return ok(await getDashboardSummary(ctx.customer.id, query))
  },
)
