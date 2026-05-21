import { NextResponse } from "next/server";
import {
  enforceManageAccess,
  enforceReadAccess,
  resolveCustomerAccess,
} from "@/features/customers";
import { addKeyword, getKeywords } from "@/features/keywords";
import { toErrorResponse } from "@/lib/http";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await params;
    const ctx = await resolveCustomerAccess({ byUserId: customerId });
    enforceReadAccess(ctx);
    return NextResponse.json(await getKeywords(ctx.customer.id));
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
    const created = await addKeyword(ctx.customer.id, await req.json());
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
