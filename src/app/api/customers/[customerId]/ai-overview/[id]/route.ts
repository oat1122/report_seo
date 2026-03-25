import { NextRequest, NextResponse } from "next/server";
import {
  enforceCustomerManageAccess,
  getCustomerAccessByUserId,
} from "@/lib/api-auth";
import { validateUploadFile } from "@/lib/file-upload";
import { prisma } from "@/lib/prisma";
import { unlink, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "ai-overview");

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

    const aiOverview = await prisma.aiOverview.findFirst({
      where: {
        id,
        customerId: access.context.customer.id,
      },
      include: { images: true },
    });

    if (!aiOverview) {
      return NextResponse.json(
        { error: "เนเธกเนเธเธเธเนเธญเธกเธนเธฅ AI Overview" },
        { status: 404 },
      );
    }

    const formData = await req.formData();
    const title = formData.get("title") as string | null;
    const displayDateStr = formData.get("displayDate") as string | null;
    const imagesToDeleteStr = formData.get("imagesToDelete") as string | null;
    const files = formData.getAll("files") as File[];

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธเธซเธฑเธงเธเนเธญ AI Overview" },
        { status: 400 },
      );
    }

    const imagesToDelete: string[] = imagesToDeleteStr
      ? JSON.parse(imagesToDeleteStr)
      : [];

    const remainingImages = aiOverview.images.filter(
      (img) => !imagesToDelete.includes(img.id),
    ).length;
    const totalImages = remainingImages + files.length;

    if (totalImages === 0) {
      return NextResponse.json(
        {
          error:
            "เธ•เนเธญเธเธกเธตเธฃเธนเธเธ เธฒเธเธญเธขเนเธฒเธเธเนเธญเธข 1 เธฃเธนเธ",
        },
        { status: 400 },
      );
    }

    if (totalImages > 3) {
      return NextResponse.json(
        {
          error:
            "เธญเธฑเธเนเธซเธฅเธ”เธฃเธนเธเธ เธฒเธเนเธ”เนเธชเธนเธเธชเธธเธ” 3 เธฃเธนเธ",
        },
        { status: 400 },
      );
    }

    for (const imageId of imagesToDelete) {
      const image = aiOverview.images.find((img) => img.id === imageId);
      if (image) {
        const filePath = path.join(process.cwd(), "public", image.imageUrl);
        if (existsSync(filePath)) {
          try {
            await unlink(filePath);
          } catch (err) {
            console.error(`Failed to delete file: ${filePath}`, err);
          }
        }
        await prisma.aiOverviewImage.delete({ where: { id: imageId } });
      }
    }

    const imageUrls: string[] = [];
    if (files.length > 0) {
      if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
      }

      for (const file of files) {
        const validationResult = await validateUploadFile(file);
        if (!validationResult.isValid || !validationResult.validatedFile) {
          return NextResponse.json(
            {
              error:
                validationResult.error ||
                "เนเธเธฅเนเนเธกเนเธเนเธฒเธเธเธฒเธฃเธ•เธฃเธงเธเธชเธญเธ",
            },
            { status: 400 },
          );
        }

        const { validatedFile } = validationResult;
        const filePath = path.join(UPLOAD_DIR, validatedFile.filename);
        await writeFile(filePath, validatedFile.buffer);
        imageUrls.push(`/uploads/ai-overview/${validatedFile.filename}`);
      }
    }

    const displayDate = displayDateStr
      ? new Date(displayDateStr)
      : aiOverview.displayDate;

    const updatedAiOverview = await prisma.aiOverview.update({
      where: { id },
      data: {
        title: title.trim(),
        displayDate,
        ...(imageUrls.length > 0 && {
          images: {
            create: imageUrls.map((url) => ({ imageUrl: url })),
          },
        }),
      },
      include: { images: true },
    });

    return NextResponse.json(updatedAiOverview);
  } catch (error) {
    console.error("Failed to update AI Overview:", error);
    return NextResponse.json(
      {
        error:
          "เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเธญเธฑเธเน€เธ”เธ— AI Overview",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
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

    const aiOverview = await prisma.aiOverview.findFirst({
      where: {
        id,
        customerId: access.context.customer.id,
      },
      include: { images: true },
    });

    if (!aiOverview) {
      return NextResponse.json(
        { error: "เนเธกเนเธเธเธเนเธญเธกเธนเธฅ AI Overview" },
        { status: 404 },
      );
    }

    for (const image of aiOverview.images) {
      const filePath = path.join(process.cwd(), "public", image.imageUrl);
      if (existsSync(filePath)) {
        try {
          await unlink(filePath);
        } catch (err) {
          console.error(`Failed to delete file: ${filePath}`, err);
        }
      }
    }

    await prisma.aiOverview.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "เธฅเธ AI Overview เธชเธณเน€เธฃเนเธ",
    });
  } catch (error) {
    console.error("Failed to delete AI Overview:", error);
    return NextResponse.json(
      {
        error:
          "เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเธฅเธ AI Overview",
      },
      { status: 500 },
    );
  }
}
