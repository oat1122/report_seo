import { NextResponse } from "next/server";
import {
  enforceCustomerManageAccess,
  getKeywordAccessContext,
} from "@/lib/api-auth";
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
    const updatedKeyword = await customerService.updateKeyword(
      keywordId,
      access.context.customer.userId,
      data,
    );

    return NextResponse.json(updatedKeyword);
  } catch (error) {
    console.error("Error updating keyword:", error);

    if (error instanceof Error && error.message.startsWith("Invalid data:")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof Error && error.message === "Keyword not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof Error && error.message.startsWith("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    await customerService.deleteKeyword(
      keywordId,
      access.context.customer.userId,
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting keyword:", error);

    if (error instanceof Error && error.message === "Keyword not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof Error && error.message.startsWith("Forbidden")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
