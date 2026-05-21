import { NextResponse } from "next/server";
import {
  enforceManageAccess,
  resolveCustomerAccess,
} from "@/features/customers";
import {
  deleteRecommendation,
  updateRecommendation,
} from "@/features/recommendations";
import { toErrorResponse } from "@/lib/http";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ recommendId: string }> },
) {
  try {
    const { recommendId } = await params;
    const ctx = await resolveCustomerAccess({ byRecommendId: recommendId });
    enforceManageAccess(ctx);
    const updated = await updateRecommendation(recommendId, await req.json());
    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ recommendId: string }> },
) {
  try {
    const { recommendId } = await params;
    const ctx = await resolveCustomerAccess({ byRecommendId: recommendId });
    enforceManageAccess(ctx);
    await deleteRecommendation(recommendId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
