import { NextRequest, NextResponse } from "next/server";
import {
  enforceCustomerManageAccess,
  getCustomerAccessByUserId,
} from "@/lib/api-auth";
import { toErrorResponse } from "@/lib/http";
import { BadRequestError } from "@/lib/errors";
import { aiOverviewService } from "@/services/AiOverviewService";
import {
  aiOverviewUpdateSchema,
  imagesToDeleteSchema,
} from "@/schemas/aiOverview";

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
    const access = await getCustomerAccessByUserId(customerId);

    if (access.response || !access.context) {
      return access.response;
    }

    const permissionError = enforceCustomerManageAccess(access.context);
    if (permissionError) {
      return permissionError;
    }

    const formData = await req.formData();
    const input = aiOverviewUpdateSchema.parse({
      title: formData.get("title"),
      displayDate: formData.get("displayDate") || undefined,
    });
    const imageIdsToDelete = parseImagesToDelete(
      formData.get("imagesToDelete") as string | null,
    );
    const files = formData.getAll("files") as File[];

    const updated = await aiOverviewService.update(
      access.context.customer.id,
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
    const access = await getCustomerAccessByUserId(customerId);

    if (access.response || !access.context) {
      return access.response;
    }

    const permissionError = enforceCustomerManageAccess(access.context);
    if (permissionError) {
      return permissionError;
    }

    await aiOverviewService.delete(access.context.customer.id, id);

    return NextResponse.json({
      success: true,
      message: "ลบ AI Overview สำเร็จ",
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
