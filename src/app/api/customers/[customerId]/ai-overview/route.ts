import { NextRequest, NextResponse } from "next/server";
import {
  enforceCustomerManageAccess,
  enforceCustomerReadAccess,
  getCustomerAccessByUserId,
} from "@/lib/api-auth";
import { toErrorResponse } from "@/lib/http";
import { aiOverviewService } from "@/services/AiOverviewService";
import { aiOverviewCreateSchema } from "@/schemas/aiOverview";

export async function GET(
  _req: Request,
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

    const aiOverviews = await aiOverviewService.getByCustomerId(
      access.context.customer.id,
    );

    return NextResponse.json(aiOverviews);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(
  req: NextRequest,
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

    const formData = await req.formData();
    const input = aiOverviewCreateSchema.parse({
      title: formData.get("title"),
      displayDate: formData.get("displayDate") || undefined,
    });
    const files = formData.getAll("files") as File[];

    const aiOverview = await aiOverviewService.create(
      access.context.customer.id,
      input,
      files,
    );

    return NextResponse.json(aiOverview, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
