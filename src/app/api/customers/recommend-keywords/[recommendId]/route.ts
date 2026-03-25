import { NextResponse } from "next/server";
import {
  enforceCustomerManageAccess,
  getRecommendAccessContext,
} from "@/lib/api-auth";
import { customerService } from "@/services/CustomerService";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ recommendId: string }> }
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
      access.context.customer.userId,
      body
    );

    return NextResponse.json(updatedRecommend);
  } catch (error) {
    console.error("Error updating recommend keyword:", error);

    if (error instanceof Error && error.message.startsWith("Invalid data:")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof Error && error.message === "Recommend keyword not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof Error && error.message.startsWith("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ recommendId: string }> }
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

    await customerService.deleteRecommendKeyword(
      recommendId,
      access.context.customer.userId
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting recommend keyword:", error);

    if (error instanceof Error && error.message === "Recommend keyword not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof Error && error.message.startsWith("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
