import { z } from 'zod'
import { withApiHandler, customerAccessGuard, ok } from '@/infrastructure/http'
import { bulkUpdateItemStatus, bulkUpdateItemStatusSchema } from '@/features/work-progress'
import { createNotification, NOTIFICATION_TYPES } from '@/features/notifications'

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
})

export const POST = withApiHandler(
  { params: paramsSchema, body: bulkUpdateItemStatusSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, 'manage')
    const result = await bulkUpdateItemStatus(ctx.customer.id, params.planId, session.user.id, body)

    createNotification({
      type: NOTIFICATION_TYPES.WORK_ITEM_STATUS_CHANGED,
      recipientUserIds: [ctx.customer.userId],
      actorId: session.user.id,
      title: 'เปลี่ยนสถานะแผนงาน',
      body: `อัปเดตสถานะ ${body.itemIds.length} รายการ`,
      metadata: { url: `/customer/${params.customerId}/work-progress` },
    }).catch(() => {})

    return ok(result)
  },
)
