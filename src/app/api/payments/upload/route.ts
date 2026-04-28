import { NextRequest, NextResponse } from "next/server";
import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { Role } from "@/types/auth";
import { validateUploadFile } from "@/lib/file-upload";
import { prisma } from "@/lib/prisma";
import {
  getCustomerAccessByCustomerId,
  requireSession,
} from "@/lib/api-auth";
import { toErrorResponse } from "@/lib/http";
import { BadRequestError, ForbiddenError } from "@/lib/errors";
import { buildPublicUrl, getUploadDir } from "@/lib/upload-paths";
import {
  paymentListQuerySchema,
  paymentUploadSchema,
} from "@/schemas/payment";

const UPLOAD_DIR = getUploadDir("payments");

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

    const validationResult = await validateUploadFile(file);
    if (!validationResult.isValid || !validationResult.validatedFile) {
      throw new BadRequestError(
        validationResult.error || "ไฟล์ไม่ผ่านการตรวจสอบ",
      );
    }

    const { validatedFile } = validationResult;

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const filePath = path.join(UPLOAD_DIR, validatedFile.filename);
    await writeFile(filePath, validatedFile.buffer);

    let paymentProof;
    try {
      paymentProof = await prisma.paymentProof.create({
        data: {
          uploadUrl: buildPublicUrl("payments", validatedFile.filename),
          customerId: access.context.customer.id,
          status: "PENDING",
        },
      });
    } catch (error) {
      // DB ล้มเหลว → unlink ไฟล์เพื่อกัน orphan
      try {
        await unlink(filePath);
      } catch (unlinkErr) {
        console.error("Failed to cleanup orphan file:", unlinkErr);
      }
      throw error;
    }

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

    const userRole = auth.session.user.role;

    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.customerId) where.customerId = query.customerId;

    if (userRole === Role.CUSTOMER) {
      // CUSTOMER เห็นเฉพาะของตัวเอง
      where.customer = { is: { userId: auth.session.user.id } };
    } else if (userRole === Role.SEO_DEV) {
      // SEO_DEV เห็นเฉพาะลูกค้าที่ดูแล
      where.customer = { is: { seoDevId: auth.session.user.id } };
    } else if (userRole !== Role.ADMIN) {
      throw new BadRequestError("Invalid role");
    }
    // ADMIN เห็นทั้งหมดตาม where

    const paymentProofs = await prisma.paymentProof.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
      orderBy: { uploadDate: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: paymentProofs,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
