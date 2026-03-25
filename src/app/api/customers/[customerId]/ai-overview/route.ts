import { NextRequest, NextResponse } from "next/server";
import {
  enforceCustomerManageAccess,
  enforceCustomerReadAccess,
  getCustomerAccessByUserId,
} from "@/lib/api-auth";
import { validateUploadFile } from "@/lib/file-upload";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "ai-overview");

export async function GET(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> }
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

    const aiOverviews = await prisma.aiOverview.findMany({
      where: { customerId: access.context.customer.id },
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(aiOverviews);
  } catch (error) {
    console.error("Failed to fetch AI Overview:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
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
    const title = formData.get("title") as string | null;
    const displayDateStr = formData.get("displayDate") as string | null;
    const files = formData.getAll("files") as File[];

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธเธซเธฑเธงเธเนเธญ AI Overview" },
        { status: 400 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "เธเธฃเธธเธ“เธฒเธญเธฑเธเนเธซเธฅเธ”เธฃเธนเธเธ เธฒเธเธญเธขเนเธฒเธเธเนเธญเธข 1 เธฃเธนเธ" },
        { status: 400 }
      );
    }

    if (files.length > 3) {
      return NextResponse.json(
        { error: "เธญเธฑเธเนเธซเธฅเธ”เธฃเธนเธเธ เธฒเธเนเธ”เนเธชเธนเธเธชเธธเธ” 3 เธฃเธนเธ" },
        { status: 400 }
      );
    }

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const imageUrls: string[] = [];
    for (const file of files) {
      const validationResult = await validateUploadFile(file);
      if (!validationResult.isValid || !validationResult.validatedFile) {
        return NextResponse.json(
          { error: validationResult.error || "เนเธเธฅเนเนเธกเนเธเนเธฒเธเธเธฒเธฃเธ•เธฃเธงเธเธชเธญเธ" },
          { status: 400 }
        );
      }

      const { validatedFile } = validationResult;
      const filePath = path.join(UPLOAD_DIR, validatedFile.filename);
      await writeFile(filePath, validatedFile.buffer);
      imageUrls.push(`/uploads/ai-overview/${validatedFile.filename}`);
    }

    const displayDate = displayDateStr ? new Date(displayDateStr) : new Date();

    const aiOverview = await prisma.aiOverview.create({
      data: {
        title: title.trim(),
        displayDate,
        customerId: access.context.customer.id,
        images: {
          create: imageUrls.map((url) => ({ imageUrl: url })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json(aiOverview, { status: 201 });
  } catch (error) {
    console.error("Failed to create AI Overview:", error);
    return NextResponse.json(
      { error: "เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเธชเธฃเนเธฒเธ AI Overview" },
      { status: 500 }
    );
  }
}
