import { NextResponse } from "next/server";
import {
  enforceReadAccess,
  resolveCustomerAccess,
} from "@/features/customers";
import { getCustomerReport } from "@/features/customer-report";
import { toErrorResponse } from "@/lib/http";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await params;
    const ctx = await resolveCustomerAccess({ byUserId: customerId });
    enforceReadAccess(ctx);
    return NextResponse.json(await getCustomerReport(customerId));
  } catch (error) {
    return toErrorResponse(error);
  }
}
