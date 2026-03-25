import { NextResponse } from "next/server";
import {
  enforceCustomerManageAccess,
  enforceCustomerReadAccess,
  getCustomerAccessByUserId,
} from "@/lib/api-auth";
import { customerService } from "@/services/CustomerService";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await params;
    const access = await getCustomerAccessByUserId(customerId);

    if (access.response || !access.context) {
      return access.response;
    }

    const permissionError = enforceCustomerReadAccess(access.context);
    if (permissionError) {
      return permissionError;
    }

    const keywords = await customerService.getRecommendKeywords(customerId);
    return NextResponse.json(keywords);
  } catch (error) {
    console.error("Error fetching recommend keywords:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await params;
    const access = await getCustomerAccessByUserId(customerId);

    if (access.response || !access.context) {
      return access.response;
    }

    const permissionError = enforceCustomerManageAccess(access.context);
    if (permissionError) {
      return permissionError;
    }

    const body = await req.json();
    const newKeyword = await customerService.addRecommendKeyword(
      customerId,
      body,
    );
    return NextResponse.json(newKeyword, { status: 201 });
  } catch (error) {
    console.error("Error creating recommend keyword:", error);

    if (error instanceof Error && error.message.startsWith("Invalid data:")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof Error && error.message === "Customer not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
