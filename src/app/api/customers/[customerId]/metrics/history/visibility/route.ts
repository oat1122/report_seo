import { z } from "zod";
import { withApiHandler, customerAccessGuard, ok } from "@/infrastructure/http";
import {
  bulkSetMetricsHistoryVisibility,
  historyVisibilitySchema,
  setMetricsHistoryVisibility,
} from "@/features/metrics";
import {
  createNotification,
  NOTIFICATION_TYPES,
} from "@/features/notifications";

const paramsSchema = z.object({ customerId: z.uuid() });

export const PATCH = withApiHandler(
  { params: paramsSchema, body: historyVisibilitySchema },
  async ({ params, body, session }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, "manage");
    const customerInternalId = ctx.customer.id;

    let result: { updated: number };

    if (body.historyIds) {
      result = await bulkSetMetricsHistoryVisibility(
        body.historyIds,
        body.isVisible,
        customerInternalId,
      );
    } else if (body.historyId) {
      result = await setMetricsHistoryVisibility(
        body.historyId,
        body.isVisible,
        customerInternalId,
      );
    } else {
      return ok({ updated: 0 });
    }

    if (body.isVisible && result.updated > 0) {
      createNotification({
        type: NOTIFICATION_TYPES.METRICS_UPDATED,
        recipientUserIds: [ctx.customer.userId],
        actorId: session.user.id,
        title: "อัปเดต Metrics",
        body: "มีข้อมูล Overall Metrics ใหม่",
        metadata: { url: `/customer/${params.customerId}` },
      }).catch(() => {});
    }

    return ok(result);
  },
);
