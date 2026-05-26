import { z } from "zod";
import {
  withApiHandler,
  customerAccessGuard,
  ok,
} from "@/infrastructure/http";
import { toggleSubtask } from "@/features/work-progress";
import {
  createNotification,
  NOTIFICATION_TYPES,
} from "@/features/notifications";

const paramsSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  itemId: z.string().uuid(),
  subtaskId: z.string().uuid(),
});

export const POST = withApiHandler(
  { params: paramsSchema },
  async ({ params, session }) => {
    const ctx = await customerAccessGuard(
      { byUserId: params.customerId },
      "manage",
    );
    const result = await toggleSubtask(
      ctx.customer.id,
      params.planId,
      params.itemId,
      params.subtaskId,
      session.user.id,
    );

    createNotification({
      type: NOTIFICATION_TYPES.WORK_ITEM_UPDATED,
      recipientUserIds: [ctx.customer.userId],
      actorId: session.user.id,
      title: "อัปเดตแผนงาน",
      body: `Subtask "${result.title}" ${result.isDone ? "เสร็จสิ้น" : "ยังไม่เสร็จ"}`,
      metadata: { url: `/customer/${params.customerId}/work-progress` },
    }).catch(() => {});

    return ok(result);
  },
);
