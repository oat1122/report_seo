import { z } from 'zod'
import { withApiHandler, ok } from '@/infrastructure/http'
import { Role } from '@/types/auth'
import { syncCustomerMetricsByUserId } from '@/features/metrics'
import { bangkokToday } from '@/lib/date'

// customerId ในพาธ = userId ของลูกค้า (ตรงกับคอนเวนชัน route /api/customers/[customerId]/metrics)
const paramsSchema = z.object({ customerId: z.uuid() })

export const POST = withApiHandler(
  { roles: [Role.ADMIN], params: paramsSchema },
  async ({ params }) => {
    return ok(await syncCustomerMetricsByUserId(params.customerId, bangkokToday()))
  },
)
