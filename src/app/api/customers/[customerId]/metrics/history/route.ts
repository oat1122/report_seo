import { NextResponse } from "next/server";
import {
  enforceCustomerReadAccess,
  getCustomerAccessByUserId,
} from "@/lib/api-auth";
import { toErrorResponse } from "@/lib/http";
import { customerService } from "@/services/CustomerService";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await params;
    const access = await getCustomerAccessByUserId(customerId);

    if (access.response || !access.context) {
      return access.response;
    }

    const permissionError = enforceCustomerReadAccess(access.context);
    if (permissionError) {
      return permissionError;
    }

    const history = await customerService.getMetricsHistory(
      access.context.customer.id,
    );
    return NextResponse.json(history);
  } catch (error) {
    return toErrorResponse(error);
  }
}
