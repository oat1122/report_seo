import { z } from "zod";
import { withApiHandler, customerAccessGuard, ok } from "@/infrastructure/http";
import {
  bulkSetMetricsHistoryVisibility,
  historyVisibilitySchema,
  setMetricsHistoryVisibility,
} from "@/features/metrics";

const paramsSchema = z.object({ customerId: z.string().min(1) });

export const PATCH = withApiHandler(
  { params: paramsSchema, body: historyVisibilitySchema },
  async ({ params, body }) => {
    const ctx = await customerAccessGuard({ byUserId: params.customerId }, "manage");
    const customerInternalId = ctx.customer.id;

    if (body.historyIds) {
      return ok(
        await bulkSetMetricsHistoryVisibility(
          body.historyIds,
          body.isVisible,
          customerInternalId,
        ),
      );
    }
    if (body.historyId) {
      return ok(
        await setMetricsHistoryVisibility(
          body.historyId,
          body.isVisible,
          customerInternalId,
        ),
      );
    }
    return ok({ updated: 0 });
  },
);
