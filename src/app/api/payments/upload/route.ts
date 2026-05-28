import { withApiHandler, customerAccessGuard, ok, created, parseQuery } from '@/infrastructure/http'
import {
  listPaymentProofs,
  paymentListQuerySchema,
  paymentUploadSchema,
  uploadPaymentProof,
} from '@/features/payments'
import { BadRequestError } from '@/lib/errors'
import { Role } from '@/types/auth'

export const POST = withApiHandler({}, async ({ req }) => {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    throw new BadRequestError('กรุณาเลือกไฟล์ที่ต้องการอัปโหลด')
  }

  const { customerId } = paymentUploadSchema.parse({
    customerId: formData.get('customerId'),
  })

  // admin / seoDev ที่ดูแล / owner สามารถอัปโหลดสลิปได้ (เท่ากับ canRead)
  const ctx = await customerAccessGuard({ byCustomerId: customerId }, 'read')

  const proof = await uploadPaymentProof(file, ctx.customer.id)
  return created({
    id: proof.id,
    uploadUrl: proof.uploadUrl,
    status: proof.status,
    uploadDate: proof.uploadDate,
  })
})

export const GET = withApiHandler({}, async ({ req, session }) => {
  const query = parseQuery(req, paymentListQuerySchema)
  const data = await listPaymentProofs(query, {
    user: {
      id: session.user.id,
      role: session.user.role as Role,
    },
  })
  return ok(data)
})
