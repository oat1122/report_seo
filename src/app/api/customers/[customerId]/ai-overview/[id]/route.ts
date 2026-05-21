import { NextRequest, NextResponse } from "next/server";
import {
  enforceManageAccess,
  resolveCustomerAccess,
} from "@/features/customers";
import {
  aiOverviewUpdateSchema,
  deleteAiOverview,
  imagesToDeleteSchema,
  updateAiOverview,
} from "@/features/ai-overview";
import { toErrorResponse } from "@/lib/http";
import { BadRequestError } from "@/lib/errors";

function parseImagesToDelete(value: string | null): string[] {
  if (!value) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new BadRequestError("imagesToDelete ต้องเป็น JSON array ที่ถูกต้อง");
  }
  return imagesToDeleteSchema.parse(parsed);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string; id: string }> },
) {
  try {
    const { customerId, id } = await params;
    const ctx = await resolveCustomerAccess({ byUserId: customerId });
    enforceManageAccess(ctx);

    const formData = await req.formData();
    const input = aiOverviewUpdateSchema.parse({
      title: formData.get("title"),
      displayDate: formData.get("displayDate") || undefined,
    });
    const imageIdsToDelete = parseImagesToDelete(
      formData.get("imagesToDelete") as string | null,
    );
    const files = formData.getAll("files") as File[];

    const updated = await updateAiOverview(
      ctx.customer.id,
      id,
      input,
      files,
      imageIdsToDelete,
    );
    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ customerId: string; id: string }> },
) {
  try {
    const { customerId, id } = await params;
    const ctx = await resolveCustomerAccess({ byUserId: customerId });
    enforceManageAccess(ctx);
    await deleteAiOverview(ctx.customer.id, id);
    return NextResponse.json({
      success: true,
      message: "ลบ AI Overview สำเร็จ",
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
