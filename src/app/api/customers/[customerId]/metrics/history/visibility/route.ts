import { NextResponse } from "next/server";
import {
  enforceCustomerManageAccess,
  getCustomerAccessByUserId,
} from "@/lib/api-auth";
import { toErrorResponse } from "@/lib/http";
import { customerService } from "@/services/CustomerService";
import { historyVisibilitySchema } from "@/schemas/historyVisibility";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await params;
    const access = await getCustomerAccessByUserId(customerId);

    if (access.response || !access.context) {
      return access.response;
    }

    const permissionError = enforceCustomerManageAccess(access.context);
    if (permissionError) {
      return permissionError;
    }

    const body = await req.json();
    const input = historyVisibilitySchema.parse(body);

    const customerInternalId = access.context.customer.id;

    if (input.historyIds) {
      const result = await customerService.bulkSetMetricsHistoryVisibility(
        input.historyIds,
        input.isVisible,
        customerInternalId,
      );
      return NextResponse.json(result);
    }

    if (input.historyId) {
      const result = await customerService.setMetricsHistoryVisibility(
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
