import { z } from 'zod'
import { withApiHandler, customerAccessGuard, created } from '@/infrastructure/http'
import { uploadCustomerDocument, uploadDocumentSchema } from '@/features/billing-documents'
import { BadRequestError } from '@/lib/errors'

const paramsSchema = z.object({ customerId: z.string().uuid() })

export const POST = withApiHandler({ params: paramsSchema }, async ({ req, params }) => {
  const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) throw new BadRequestError('กรุณาเลือกไฟล์ที่ต้องการอัปโหลด')

  const rawCycleId = formData.get('billingCycleId')
  const { type, billingCycleId } = uploadDocumentSchema.parse({
    type: formData.get('type'),
    billingCycleId: typeof rawCycleId === 'string' && rawCycleId ? rawCycleId : null,
  })

  const result = await uploadCustomerDocument(file, ctx.customer.id, type, billingCycleId ?? null)
  return created(result)
})
