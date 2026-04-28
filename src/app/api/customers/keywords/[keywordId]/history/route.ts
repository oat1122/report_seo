import { NextResponse } from "next/server";
import {
  enforceCustomerReadAccess,
  getKeywordAccessContext,
} from "@/lib/api-auth";
import { toErrorResponse } from "@/lib/http";
import { customerService } from "@/services/CustomerService";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ keywordId: string }> },
) {
  try {
    const { keywordId } = await params;
    const access = await getKeywordAccessContext(keywordId);

    if (access.response || !access.context) {
      return access.response;
    }

    const permissionError = enforceCustomerReadAccess(access.context);
    if (permissionError) {
      return permissionError;
    }

    const history = await customerService.getKeywordHistory(keywordId);
    return NextResponse.json(history);
  } catch (error) {
    return toErrorResponse(error);
  }
}
