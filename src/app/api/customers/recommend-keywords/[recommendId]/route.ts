import { NextResponse } from "next/server";
import {
  enforceCustomerManageAccess,
  getRecommendAccessContext,
} from "@/lib/api-auth";
import { toErrorResponse } from "@/lib/http";
import { customerService } from "@/services/CustomerService";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ recommendId: string }> },
) {
  try {
    const { recommendId } = await params;
    const access = await getRecommendAccessContext(recommendId);

    if (access.response || !access.context) {
      return access.response;
    }

    const permissionError = enforceCustomerManageAccess(access.context);
    if (permissionError) {
      return permissionError;
    }

    const body = await req.json();
    const updatedRecommend = await customerService.updateRecommendKeyword(
      recommendId,
      body,
    );

    return NextResponse.json(updatedRecommend);
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
    const access = await getRecommendAccessContext(recommendId);

    if (access.response || !access.context) {
      return access.response;
    }

    const permissionError = enforceCustomerManageAccess(access.context);
    if (permissionError) {
      return permissionError;
    }

    await customerService.deleteRecommendKeyword(recommendId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
