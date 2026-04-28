import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { validateUploadFile } from "@/lib/file-upload";
import { buildPublicUrl, getUploadDir } from "@/lib/upload-paths";
import { BadRequestError } from "@/lib/errors";
import { Role } from "@/types/auth";
import type { PaymentListQuery } from "@/schemas/payment";

const UPLOAD_DIR = getUploadDir("payments");

class PaymentService {
  /**
   * อัปโหลดสลิป — caller ต้องตรวจ access แล้ว
   * Atomic: เขียนไฟล์ → DB create → ถ้า DB throw ลบไฟล์
   */
  async uploadProof(file: File, customerInternalId: string) {
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

    try {
      return await prisma.paymentProof.create({
        data: {
          uploadUrl: buildPublicUrl("payments", validatedFile.filename),
          customerId: customerInternalId,
          status: "PENDING",
        },
      });
    } catch (error) {
      try {
        await unlink(filePath);
      } catch (unlinkErr) {
        console.error("Failed to cleanup orphan file:", unlinkErr);
      }
      throw error;
    }
  }

  /**
   * ดึงรายการสลิปตาม role + filter
   * - CUSTOMER เห็นเฉพาะของตัวเอง
   * - SEO_DEV เห็นเฉพาะลูกค้าที่ดูแล
   * - ADMIN เห็นทั้งหมดตาม filter
   */
  async listProofs(
    query: PaymentListQuery,
    session: { user: { id: string; role: Role } },
  ) {
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.customerId) where.customerId = query.customerId;

    if (session.user.role === Role.CUSTOMER) {
      where.customer = { is: { userId: session.user.id } };
    } else if (session.user.role === Role.SEO_DEV) {
      where.customer = { is: { seoDevId: session.user.id } };
    } else if (session.user.role !== Role.ADMIN) {
      throw new BadRequestError("Invalid role");
    }

    return prisma.paymentProof.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, domain: true },
        },
      },
      orderBy: { uploadDate: "desc" },
    });
  }
}

export const paymentService = new PaymentService();
