import { NextResponse } from "next/server";
import {
  enforceManageAccess,
  resolveCustomerAccess,
} from "@/features/customers";
import {
  bulkSetKeywordHistoryVisibility,
  historyVisibilitySchema,
  setKeywordHistoryVisibility,
} from "@/features/keywords";
import { toErrorResponse } from "@/lib/http";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await params;
    const ctx = await resolveCustomerAccess({ byUserId: customerId });
    enforceManageAccess(ctx);

    const input = historyVisibilitySchema.parse(await req.json());
    const customerInternalId = ctx.customer.id;

    if (input.historyIds) {
      const result = await bulkSetKeywordHistoryVisibility(
        input.historyIds,
        input.isVisible,
        customerInternalId,
      );
      return NextResponse.json(result);
    }

    if (input.historyId) {
      const result = await setKeywordHistoryVisibility(
        input.historyId,
        input.isVisible,
        customerInternalId,
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ updated: 0 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
