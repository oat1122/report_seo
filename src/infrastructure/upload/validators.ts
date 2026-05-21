/**
 * File Upload Validation Utility
 * ป้องกันการอัปโหลดไฟล์อันตราย เช่น .php, .sh, xmrig
 * อนุญาตเฉพาะไฟล์รูปภาพ .jpg, .jpeg, .png เท่านั้น
 */

import { fileTypeFromBuffer } from "file-type";
import crypto from "crypto";

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"] as const;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFilename?: string;
}

export interface ValidatedFile {
  buffer: Buffer;
  filename: string;
  mimeType: "image/jpeg" | "image/png";
  size: number;
}

export function validateExtension(filename: string): FileValidationResult {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));

  if (
    !ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])
  ) {
    return {
      isValid: false,
      error: `ไฟล์ประเภท ${ext} ไม่ได้รับอนุญาต อนุญาตเฉพาะ ${ALLOWED_EXTENSIONS.join(
        ", ",
      )}`,
    };
  }

  return { isValid: true };
}

export function validateMimeType(mimeType: string): FileValidationResult {
  if (
    !ALLOWED_MIME_TYPES.includes(
      mimeType as (typeof ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return {
      isValid: false,
      error: `MIME type ${mimeType} ไม่ได้รับอนุญาต อนุญาตเฉพาะ ${ALLOWED_MIME_TYPES.join(
        ", ",
      )}`,
    };
  }

  return { isValid: true };
}

export function validateFileSize(size: number): FileValidationResult {
  if (size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    return {
      isValid: false,
      error: `ไฟล์มีขนาดใหญ่เกินไป (ไม่เกิน ${maxSizeMB}MB)`,
    };
  }

  return { isValid: true };
}

/**
 * sniff ทั้ง container ไม่ใช่แค่ 3 byte แรก ป้องกัน polyglot
 */
export async function validateMagicBytes(
  buffer: Buffer,
  expectedMimeType: string,
): Promise<FileValidationResult> {
  const detected = await fileTypeFromBuffer(buffer);

  if (!detected) {
    return {
      isValid: false,
      error: "ไม่สามารถตรวจสอบประเภทไฟล์ได้",
    };
  }

  if (detected.mime !== expectedMimeType) {
    return {
      isValid: false,
      error: `ไฟล์ไม่ตรงกับประเภทที่ระบุ (พบ ${detected.mime} แต่ต้องการ ${expectedMimeType})`,
    };
  }

  if (
    !ALLOWED_MIME_TYPES.includes(
      detected.mime as (typeof ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return {
      isValid: false,
      error: `ประเภทไฟล์จริง ${detected.mime} ไม่ได้รับอนุญาต`,
    };
  }

  return { isValid: true };
}

/**
 * ต่อท้ายด้วย timestamp + uuid เพื่อกัน collision ใน ms เดียวกัน
 */
export function sanitizeFilename(filename: string): string {
  let sanitized = filename.replace(/\.\./g, "");
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "_");

  const ext = sanitized.slice(sanitized.lastIndexOf("."));
  const name = sanitized.slice(0, sanitized.lastIndexOf("."));
  const timestamp = Date.now();
  const unique = crypto.randomUUID().slice(0, 8);

  return `${name}_${timestamp}_${unique}${ext}`;
}

export async function validateUploadFile(
  file: File,
): Promise<FileValidationResult & { validatedFile?: ValidatedFile }> {
  if (!file || !file.name) {
    return { isValid: false, error: "ไม่พบไฟล์" };
  }

  const extResult = validateExtension(file.name);
  if (!extResult.isValid) return extResult;

  const mimeResult = validateMimeType(file.type);
  if (!mimeResult.isValid) return mimeResult;

  const sizeResult = validateFileSize(file.size);
  if (!sizeResult.isValid) return sizeResult;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const magicResult = await validateMagicBytes(buffer, file.type);
  if (!magicResult.isValid) return magicResult;

  const sanitizedFilename = sanitizeFilename(file.name);

  return {
    isValid: true,
    sanitizedFilename,
    validatedFile: {
      buffer,
      filename: sanitizedFilename,
      mimeType: file.type as "image/jpeg" | "image/png",
      size: file.size,
    },
  };
}

export async function validateUploadBuffer(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<FileValidationResult & { validatedFile?: ValidatedFile }> {
  const extResult = validateExtension(filename);
  if (!extResult.isValid) return extResult;

  const mimeResult = validateMimeType(mimeType);
  if (!mimeResult.isValid) return mimeResult;

  const sizeResult = validateFileSize(buffer.length);
  if (!sizeResult.isValid) return sizeResult;

  const magicResult = await validateMagicBytes(buffer, mimeType);
  if (!magicResult.isValid) return magicResult;

  const sanitizedFilename = sanitizeFilename(filename);

  return {
    isValid: true,
    sanitizedFilename,
    validatedFile: {
      buffer,
      filename: sanitizedFilename,
      mimeType: mimeType as "image/jpeg" | "image/png",
      size: buffer.length,
    },
  };
}
