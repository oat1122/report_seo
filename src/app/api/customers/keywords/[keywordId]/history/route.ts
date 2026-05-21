import { NextResponse } from "next/server";
import {
  enforceReadAccess,
  resolveCustomerAccess,
} from "@/features/customers";
import { getKeywordHistory } from "@/features/keywords";
import { toErrorResponse } from "@/lib/http";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ keywordId: string }> },
) {
  try {
    const { keywordId } = await params;
    const ctx = await resolveCustomerAccess({ byKeywordId: keywordId });
    enforceReadAccess(ctx);
    const history = await getKeywordHistory(keywordId, {
      onlyVisible: !ctx.canManage,
    });
    return NextResponse.json(history);
  } catch (error) {
    return toErrorResponse(error);
  }
}
