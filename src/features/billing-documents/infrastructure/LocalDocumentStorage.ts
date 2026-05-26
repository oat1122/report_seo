import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { buildPublicUrl, getUploadDir } from "@/lib/upload-paths";
import { logger } from "@/lib/logger";
import type { DocumentStorage } from "../application/ports/DocumentStorage";

const UPLOAD_CATEGORY = "documents" as const;
const UPLOAD_DIR = getUploadDir(UPLOAD_CATEGORY);

export class LocalDocumentStorage implements DocumentStorage {
  async savePdf(buffer: Buffer, filename: string): Promise<string> {
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }
    const absolutePath = path.join(UPLOAD_DIR, filename);
    await writeFile(absolutePath, buffer);
    return buildPublicUrl(UPLOAD_CATEGORY, filename);
  }

  async deletePdf(url: string): Promise<void> {
    try {
      const trimmed = url.startsWith("/") ? url.slice(1) : url;
      const absolutePath = path.resolve(process.cwd(), "public", trimmed);
      if (existsSync(absolutePath)) {
        await unlink(absolutePath);
      }
    } catch (err) {
      logger.warn({ err, url }, "failed to cleanup document PDF");
    }
  }
}
