import { NextResponse } from "next/server";
import {
  enforceManageAccess,
  resolveCustomerAccess,
} from "@/features/customers";
import { deleteKeyword, updateKeyword } from "@/features/keywords";
import { toErrorResponse } from "@/lib/http";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ keywordId: string }> },
) {
  try {
    const { keywordId } = await params;
    const ctx = await resolveCustomerAccess({ byKeywordId: keywordId });
    enforceManageAccess(ctx);
    const updated = await updateKeyword(keywordId, await req.json());
    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ keywordId: string }> },
) {
  try {
    const { keywordId } = await params;
    const ctx = await resolveCustomerAccess({ byKeywordId: keywordId });
    enforceManageAccess(ctx);
    await deleteKeyword(keywordId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
