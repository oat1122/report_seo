import { z } from 'zod'
import { withApiHandler, ok, customerAccessGuard } from '@/infrastructure/http'
import { getCustomerForDocument } from '@/features/billing-documents'
import { NotFoundError } from '@/lib/errors'

const paramsSchema = z.object({ customerId: z.string().uuid() })

export const GET = withApiHandler({ params: paramsSchema }, async ({ params }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')
  const info = await getCustomerForDocument(ctx.customer.id)
  if (!info) throw new NotFoundError('ไม่พบข้อมูลลูกค้า')
  return ok(info)
})
