import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { validateUploadFile } from "@/infrastructure/upload/validators";
import { buildPublicUrl, getUploadDir } from "@/lib/upload-paths";
import { BadRequestError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type {
  ContractFileStorage,
  SavedContractFile,
} from "../application/ports/ContractFileStorage";

const UPLOAD_CATEGORY = "contracts" as const;
const UPLOAD_DIR = getUploadDir(UPLOAD_CATEGORY);

export class LocalContractFileStorage implements ContractFileStorage {
  async validateAndWrite(file: File): Promise<SavedContractFile> {
    const result = await validateUploadFile(file, { allowedKinds: ["FILE"] });
    if (!result.isValid || !result.validatedFile) {
      throw new BadRequestError(result.error || "ไฟล์ไม่ผ่านการตรวจสอบ");
    }

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const absolutePath = path.join(UPLOAD_DIR, result.validatedFile.filename);
    await writeFile(absolutePath, result.validatedFile.buffer);

    return {
      url: buildPublicUrl(UPLOAD_CATEGORY, result.validatedFile.filename),
      absolutePath,
      fileName: file.name,
    };
  }

  async removeByAbsolutePath(absolutePath: string): Promise<void> {
    try {
      if (existsSync(absolutePath)) {
        await unlink(absolutePath);
      }
    } catch (err) {
      logger.warn({ err, absolutePath }, "failed to cleanup contract file");
    }
  }
}
