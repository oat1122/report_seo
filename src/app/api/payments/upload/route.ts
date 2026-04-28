import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerAccessByCustomerId,
  requireSession,
} from "@/lib/api-auth";
import { toErrorResponse } from "@/lib/http";
import { BadRequestError, ForbiddenError } from "@/lib/errors";
import { paymentService } from "@/services/PaymentService";
import {
  paymentListQuerySchema,
  paymentUploadSchema,
} from "@/schemas/payment";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw new BadRequestError("กรุณาเลือกไฟล์ที่ต้องการอัปโหลด");
    }

    const { customerId } = paymentUploadSchema.parse({
      customerId: formData.get("customerId"),
    });

    const access = await getCustomerAccessByCustomerId(customerId);
    if (access.response || !access.context) {
      return access.response;
    }
    const { isAdmin, isOwner, isAssignedSeoDev } = access.context;
    if (!isAdmin && !isOwner && !isAssignedSeoDev) {
      throw new ForbiddenError();
    }

    const paymentProof = await paymentService.uploadProof(
      file,
      access.context.customer.id,
    );

    return NextResponse.json({
      success: true,
      message: "อัปโหลดสลิปสำเร็จ",
      data: {
        id: paymentProof.id,
        uploadUrl: paymentProof.uploadUrl,
        status: paymentProof.status,
        uploadDate: paymentProof.uploadDate,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth.response || !auth.session) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const query = paymentListQuerySchema.parse({
      status: searchParams.get("status") || undefined,
      customerId: searchParams.get("customerId") || undefined,
    });

    const data = await paymentService.listProofs(query, auth.session);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return toErrorResponse(error);
  }
}
