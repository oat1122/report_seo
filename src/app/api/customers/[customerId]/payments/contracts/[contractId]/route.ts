import { z } from 'zod'
import { withApiHandler, customerAccessGuard, noContent } from '@/infrastructure/http'
import { deleteContractFile } from '@/features/payments'

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  contractId: z.string().uuid(),
})

export const DELETE = withApiHandler({ params: paramsSchema }, async ({ params }) => {
  // 'manage' = ADMIN | assigned SEO_DEV — ตรงกับสิทธิ์ upload contract ใน POST
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')
  await deleteContractFile(params.contractId, ctx.customer.id)
  return noContent()
})
