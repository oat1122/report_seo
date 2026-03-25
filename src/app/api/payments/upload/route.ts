import { NextRequest, NextResponse } from "next/server";
import { Role } from "@/types/auth";
import { validateUploadFile } from "@/lib/file-upload";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/api-auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "payments");

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSession();

    if (auth.response || !auth.session) {
      return auth.response;
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const customerId = formData.get("customerId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเนเธเธฅเนเธ—เธตเนเธ•เนเธญเธเธเธฒเธฃเธญเธฑเธเนเธซเธฅเธ”" },
        { status: 400 }
      );
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธ customerId" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        userId: true,
        seoDevId: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธฅเธนเธเธเนเธฒ" }, { status: 404 });
    }

    const isAdmin = auth.session.user.role === Role.ADMIN;
    const isOwner = auth.session.user.id === customer.userId;
    const isAssignedSeoDev =
      auth.session.user.role === Role.SEO_DEV &&
      auth.session.user.id === customer.seoDevId;

    if (!isAdmin && !isOwner && !isAssignedSeoDev) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const validationResult = await validateUploadFile(file);

    if (!validationResult.isValid || !validationResult.validatedFile) {
      return NextResponse.json(
        { error: validationResult.error || "เนเธเธฅเนเนเธกเนเธเนเธฒเธเธเธฒเธฃเธ•เธฃเธงเธเธชเธญเธ" },
        { status: 400 }
      );
    }

    const { validatedFile } = validationResult;

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const filePath = path.join(UPLOAD_DIR, validatedFile.filename);
    await writeFile(filePath, validatedFile.buffer);

    const uploadUrl = `/uploads/payments/${validatedFile.filename}`;

    const paymentProof = await prisma.paymentProof.create({
      data: {
        uploadUrl,
        customerId,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "เธญเธฑเธเนเธซเธฅเธ”เธชเธฅเธดเธเธชเธณเน€เธฃเนเธ",
      data: {
        id: paymentProof.id,
        uploadUrl,
        status: paymentProof.status,
        uploadDate: paymentProof.uploadDate,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเธญเธฑเธเนเธซเธฅเธ”เนเธเธฅเน" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSession();

    if (auth.response || !auth.session) {
      return auth.response;
    }

    const userRole = auth.session.user.role;
    if (userRole !== Role.ADMIN && userRole !== Role.SEO_DEV) {
      return NextResponse.json(
        { error: "เนเธกเนเธกเธตเธชเธดเธ—เธเธดเนเน€เธเนเธฒเธ–เธถเธ" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");

    if (customerId && userRole === Role.SEO_DEV) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: {
          seoDevId: true,
        },
      });

      if (!customer || customer.seoDevId !== auth.session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (userRole === Role.SEO_DEV) {
      where.customer = {
        is: {
          seoDevId: auth.session.user.id,
        },
      };
    }

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
      orderBy: {
        uploadDate: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: paymentProofs,
    });
  } catch (error) {
    console.error("Get payments error:", error);
    return NextResponse.json({ error: "เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”" }, { status: 500 });
  }
}
