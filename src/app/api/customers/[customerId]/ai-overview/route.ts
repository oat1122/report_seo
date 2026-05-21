import { NextRequest, NextResponse } from "next/server";
import {
  enforceManageAccess,
  enforceReadAccess,
  resolveCustomerAccess,
} from "@/features/customers";
import {
  aiOverviewCreateSchema,
  createAiOverview,
  listAiOverviews,
} from "@/features/ai-overview";
import { toErrorResponse } from "@/lib/http";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await params;
    const ctx = await resolveCustomerAccess({ byUserId: customerId });
    enforceReadAccess(ctx);
    return NextResponse.json(await listAiOverviews(ctx.customer.id));
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
    const ctx = await resolveCustomerAccess({ byUserId: customerId });
    enforceManageAccess(ctx);

    const formData = await req.formData();
    const input = aiOverviewCreateSchema.parse({
      title: formData.get("title"),
      displayDate: formData.get("displayDate") || undefined,
    });
    const files = formData.getAll("files") as File[];

    const aiOverview = await createAiOverview(ctx.customer.id, input, files);
    return NextResponse.json(aiOverview, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
