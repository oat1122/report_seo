import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
} from "@/infrastructure/http";
import {
  setPeriodMark,
  setPeriodMarkSchema,
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

export const PUT = withApiHandler(
  { params: paramsSchema, body: setPeriodMarkSchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    const result = await setPeriodMark(
      ctx.customer.id,
      params.planId,
      params.itemId,
      session.user.id,
      body,
    );

    createNotification({
      type: NOTIFICATION_TYPES.WORK_ITEM_UPDATED,
      recipientUserIds: [ctx.customer.userId],
      actorId: session.user.id,
      title: "อัปเดตแผนงาน",
      body: "มีการอัปเดตความคืบหน้าของแผนงาน",
      metadata: { url: `/customer/${params.customerId}/work-progress` },
    }).catch(() => {});

    return ok(result);
  },
);
