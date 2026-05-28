import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok } from '@/infrastructure/http'
import { approveRejectProof, updateProofStatusSchema } from '@/features/payments'
import { createNotification, NOTIFICATION_TYPES } from '@/features/notifications'

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  proofId: z.string().uuid(),
})

export const PATCH = withApiHandler(
  { params: paramsSchema, body: updateProofStatusSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')
    const result = await approveRejectProof(params.proofId, body.status)

    const isApproved = body.status === 'APPROVED'
    createNotification({
      type: isApproved ? NOTIFICATION_TYPES.PAYMENT_APPROVED : NOTIFICATION_TYPES.PAYMENT_REJECTED,
      recipientUserIds: [ctx.customer.userId],
      actorId: session.user.id,
      title: isApproved ? 'อนุมัติการชำระเงิน' : 'ปฏิเสธการชำระเงิน',
      body: isApproved
        ? 'หลักฐานการชำระเงินได้รับการอนุมัติแล้ว'
        : 'หลักฐานการชำระเงินถูกปฏิเสธ กรุณาอัปโหลดใหม่',
      metadata: { url: `/customer/${params.customerId}/payments` },
    }).catch(() => {})

    return ok(result)
  },
)
