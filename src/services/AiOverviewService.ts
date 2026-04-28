import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { validateUploadFile, ValidatedFile } from "@/lib/file-upload";
import {
  buildPublicUrl,
  getUploadDir,
  resolveUploadPath,
} from "@/lib/upload-paths";
import {
  BadRequestError,
  NotFoundError,
} from "@/lib/errors";
import {
  AiOverviewCreateInput,
  AiOverviewUpdateInput,
  MAX_AI_OVERVIEW_IMAGES,
} from "@/schemas/aiOverview";

const UPLOAD_DIR = getUploadDir("ai-overview");

type AiOverviewWithImagesRaw = {
  id: string;
  title: string;
  displayDate: Date;
  createdAt: Date;
  customerId: string;
  images: { id: string; imageUrl: string; createdAt: Date; aiOverviewId: string }[];
};

// Serialize Date → ISO string ก่อน return ให้ตรงกับ wire format ที่ React Query consume
function serializeAiOverview(row: AiOverviewWithImagesRaw) {
  return {
    ...row,
    displayDate: row.displayDate.toISOString(),
    createdAt: row.createdAt.toISOString(),
    images: row.images.map((img) => ({
      ...img,
      createdAt: img.createdAt.toISOString(),
    })),
  };
}

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

async function validateFiles(files: File[]): Promise<ValidatedFile[]> {
  const validated: ValidatedFile[] = [];
  for (const file of files) {
    const result = await validateUploadFile(file);
    if (!result.isValid || !result.validatedFile) {
      throw new BadRequestError(result.error || "ไฟล์ไม่ผ่านการตรวจสอบ");
    }
    validated.push(result.validatedFile);
  }
  return validated;
}

async function writeFiles(
  files: ValidatedFile[],
): Promise<{ urls: string[]; absolutePaths: string[] }> {
  await ensureUploadDir();
  const urls: string[] = [];
  const absolutePaths: string[] = [];
  for (const file of files) {
    const filePath = path.join(UPLOAD_DIR, file.filename);
    await writeFile(filePath, file.buffer);
    urls.push(buildPublicUrl("ai-overview", file.filename));
    absolutePaths.push(filePath);
  }
  return { urls, absolutePaths };
}

async function safeUnlink(absolutePath: string) {
  try {
    if (existsSync(absolutePath)) {
      await unlink(absolutePath);
    }
  } catch (err) {
    console.error(`Failed to delete file: ${absolutePath}`, err);
  }
}

class AiOverviewService {
  async getByCustomerId(customerId: string) {
    const rows = await prisma.aiOverview.findMany({
      where: { customerId },
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(serializeAiOverview);
  }

  /**
   * Atomic create: เขียนไฟล์ก่อน → DB transaction. ถ้า DB throw → unlink ไฟล์ใหม่ทั้งหมด
   */
  async create(
    customerId: string,
    input: AiOverviewCreateInput,
    files: File[],
  ) {
    if (files.length === 0) {
      throw new BadRequestError("กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป");
    }
    if (files.length > MAX_AI_OVERVIEW_IMAGES) {
      throw new BadRequestError(
        `อัปโหลดรูปภาพได้สูงสุด ${MAX_AI_OVERVIEW_IMAGES} รูป`,
      );
    }

    const validated = await validateFiles(files);
    const { urls, absolutePaths } = await writeFiles(validated);

    try {
      const created = await prisma.aiOverview.create({
        data: {
          title: input.title,
          displayDate: input.displayDate ?? new Date(),
          customerId,
          images: {
            create: urls.map((url) => ({ imageUrl: url })),
          },
        },
        include: { images: true },
      });
      return serializeAiOverview(created);
    } catch (error) {
      await Promise.all(absolutePaths.map(safeUnlink));
      throw error;
    }
  }

  /**
   * Atomic update: เขียนไฟล์ใหม่ก่อน → ลบเก่า + update ใน transaction. ถ้า DB throw → unlink ไฟล์ใหม่
   */
  async update(
    customerId: string,
    id: string,
    input: AiOverviewUpdateInput,
    newFiles: File[],
    imageIdsToDelete: string[],
  ) {
    const existing = await prisma.aiOverview.findFirst({
      where: { id, customerId },
      include: { images: true },
    });

    if (!existing) {
      throw new NotFoundError("ไม่พบข้อมูล AI Overview");
    }

    const remainingCount =
      existing.images.length -
      existing.images.filter((img) => imageIdsToDelete.includes(img.id)).length;
    const totalAfterUpdate = remainingCount + newFiles.length;

    if (totalAfterUpdate === 0) {
      throw new BadRequestError("ต้องมีรูปภาพอย่างน้อย 1 รูป");
    }
    if (totalAfterUpdate > MAX_AI_OVERVIEW_IMAGES) {
      throw new BadRequestError(
        `อัปโหลดรูปภาพได้สูงสุด ${MAX_AI_OVERVIEW_IMAGES} รูป`,
      );
    }

    const validated = newFiles.length > 0 ? await validateFiles(newFiles) : [];

    const imagesToDelete = existing.images.filter((img) =>
      imageIdsToDelete.includes(img.id),
    );

    const { urls, absolutePaths } =
      validated.length > 0
        ? await writeFiles(validated)
        : { urls: [], absolutePaths: [] };

    try {
      const result = await prisma.$transaction(async (tx) => {
        if (imagesToDelete.length > 0) {
          await tx.aiOverviewImage.deleteMany({
            where: {
              id: { in: imagesToDelete.map((img) => img.id) },
            },
          });
        }

        return tx.aiOverview.update({
          where: { id },
          data: {
            title: input.title,
            displayDate: input.displayDate ?? existing.displayDate,
            ...(urls.length > 0 && {
              images: {
                create: urls.map((url) => ({ imageUrl: url })),
              },
            }),
          },
          include: { images: true },
        });
      });

      // DB เรียบร้อยแล้ว — ค่อย unlink ไฟล์เก่าทิ้ง (ผิดพลาดที่นี่ไม่ทำให้ DB กลับ)
      for (const image of imagesToDelete) {
        try {
          const absolute = resolveUploadPath(image.imageUrl, "ai-overview");
          await safeUnlink(absolute);
        } catch (err) {
          console.error("Failed to resolve old image path", err);
        }
      }

      return serializeAiOverview(result);
    } catch (error) {
      // DB rollback เกิดขึ้นแล้ว — unlink ไฟล์ใหม่ที่เพิ่งเขียน
      await Promise.all(absolutePaths.map(safeUnlink));
      throw error;
    }
  }

  /**
   * Delete: ลบ DB ก่อน (cascade ลบ images rows อยู่แล้ว) → unlink ไฟล์
   * DB เป็น source of truth; ถ้า unlink fail ไฟล์ leak ดีกว่า DB ไม่ตรง
   */
  async delete(customerId: string, id: string) {
    const existing = await prisma.aiOverview.findFirst({
      where: { id, customerId },
      include: { images: true },
    });

    if (!existing) {
      throw new NotFoundError("ไม่พบข้อมูล AI Overview");
    }

    await prisma.aiOverview.delete({ where: { id } });

    for (const image of existing.images) {
      try {
        const absolute = resolveUploadPath(image.imageUrl, "ai-overview");
        await safeUnlink(absolute);
      } catch (err) {
        console.error("Failed to resolve image path on delete", err);
      }
    }

    return { id };
  }
}

export const aiOverviewService = new AiOverviewService();
