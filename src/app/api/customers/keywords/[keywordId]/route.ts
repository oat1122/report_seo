import { NextResponse } from "next/server";
import {
  enforceCustomerManageAccess,
  getKeywordAccessContext,
} from "@/lib/api-auth";
import { toErrorResponse } from "@/lib/http";
import { customerService } from "@/services/CustomerService";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ keywordId: string }> },
) {
  try {
    const { keywordId } = await params;
    const access = await getKeywordAccessContext(keywordId);

    if (access.response || !access.context) {
      return access.response;
    }

    const permissionError = enforceCustomerManageAccess(access.context);
    if (permissionError) {
      return permissionError;
    }

    const data = await req.json();
    const updatedKeyword = await customerService.updateKeyword(keywordId, data);

    return NextResponse.json(updatedKeyword);
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
    const access = await getKeywordAccessContext(keywordId);

    if (access.response || !access.context) {
      return access.response;
    }

    const permissionError = enforceCustomerManageAccess(access.context);
    if (permissionError) {
      return permissionError;
    }

    await customerService.deleteKeyword(keywordId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
