import { NextResponse } from "next/server";
import {
  enforceManageAccess,
  enforceReadAccess,
  resolveCustomerAccess,
} from "@/features/customers";
import { getMetrics, saveMetrics } from "@/features/metrics";
import { toErrorResponse } from "@/lib/http";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await params;
    const ctx = await resolveCustomerAccess({ byUserId: customerId });
    enforceReadAccess(ctx);
    return NextResponse.json(await getMetrics(ctx.customer.id));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await params;
    const ctx = await resolveCustomerAccess({ byUserId: customerId });
    enforceManageAccess(ctx);
    const metrics = await saveMetrics(ctx.customer.id, await req.json());
    return NextResponse.json(metrics, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
