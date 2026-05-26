import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
  noContent,
} from "@/infrastructure/http";
import {
  deleteItem,
  updateItem,
  updateItemSchema,
} from "@/features/work-progress";
import {
  createNotification,
  NOTIFICATION_TYPES,
} from "@/features/notifications";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  itemId: z.string().uuid(),
});

export const PATCH = withApiHandler(
  { params: paramsSchema, body: updateItemSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    const result = await updateItem(
      ctx.customer.id,
      params.planId,
      params.itemId,
      session.user.id,
      body,
    );

    const type = body.statusId
      ? NOTIFICATION_TYPES.WORK_ITEM_STATUS_CHANGED
      : NOTIFICATION_TYPES.WORK_ITEM_UPDATED;
    createNotification({
      type,
      recipientUserIds: [ctx.customer.userId],
      actorId: session.user.id,
      title: body.statusId ? "เปลี่ยนสถานะแผนงาน" : "อัปเดตแผนงาน",
      body: `รายการ "${result.activity}" ได้รับการอัปเดต`,
      metadata: { url: `/customer/${params.customerId}/work-progress` },
    }).catch(() => {});

    return ok(result);
  },
);

export const DELETE = withApiHandler(
  { params: paramsSchema },
  async ({ params, session }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    await deleteItem(
      ctx.customer.id,
      params.planId,
      params.itemId,
      session.user.id,
    );
    return noContent();
  },
);
