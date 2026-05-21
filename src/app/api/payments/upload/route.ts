import { NextRequest, NextResponse } from "next/server";
import {
  enforceReadAccess,
  resolveCustomerAccess,
} from "@/features/customers";
import {
  listPaymentProofs,
  paymentListQuerySchema,
  paymentUploadSchema,
  uploadPaymentProof,
} from "@/features/payments";
import { requireSession } from "@/infrastructure/auth/session";
import { toErrorResponse } from "@/lib/http";
import { BadRequestError } from "@/lib/errors";
import { Role } from "@/types/auth";

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

    // admin / seoDev ที่ดูแล / owner สามารถอัปโหลดสลิปได้ (เท่ากับ canRead)
    const ctx = await resolveCustomerAccess({ byCustomerId: customerId });
    enforceReadAccess(ctx);

    const paymentProof = await uploadPaymentProof(file, ctx.customer.id);

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
    const session = await requireSession();
    const { searchParams } = new URL(request.url);
    const query = paymentListQuerySchema.parse({
      status: searchParams.get("status") || undefined,
      customerId: searchParams.get("customerId") || undefined,
    });

    const data = await listPaymentProofs(query, {
      user: {
        id: session.user.id,
        role: session.user.role as Role,
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return toErrorResponse(error);
  }
}
