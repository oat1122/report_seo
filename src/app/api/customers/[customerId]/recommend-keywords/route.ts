import { NextResponse } from "next/server";
import {
  enforceManageAccess,
  enforceReadAccess,
  resolveCustomerAccess,
} from "@/features/customers";
import {
  addRecommendation,
  listRecommendations,
} from "@/features/recommendations";
import { toErrorResponse } from "@/lib/http";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await params;
    const ctx = await resolveCustomerAccess({ byUserId: customerId });
    enforceReadAccess(ctx);
    return NextResponse.json(await listRecommendations(ctx.customer.id));
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
    const created = await addRecommendation(ctx.customer.id, await req.json());
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
