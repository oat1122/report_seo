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

    const report = await customerService.getCustomerReport(customerId);

    return NextResponse.json(report);
  } catch (error) {
    return toErrorResponse(error);
  }
}
