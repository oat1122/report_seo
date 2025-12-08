/**
 * File Upload Validation Utility
 * ป้องกันการอัปโหลดไฟล์อันตราย เช่น .php, .sh, xmrig
 * อนุญาตเฉพาะไฟล์รูปภาพ .jpg, .jpeg, .png เท่านั้น
 */

// ===== Configuration =====
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"] as const;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Magic bytes (file signatures) สำหรับตรวจสอบชนิดไฟล์จริง
const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff], // JPEG signature
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG signature
};

// ===== Types =====
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

// ===== Validation Functions =====

/**
 * ตรวจสอบนามสกุลไฟล์
 */
export function validateExtension(filename: string): FileValidationResult {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));

  if (
    !ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])
  ) {
    return {
      isValid: false,
      error: `ไฟล์ประเภท ${ext} ไม่ได้รับอนุญาต อนุญาตเฉพาะ ${ALLOWED_EXTENSIONS.join(
        ", "
      )}`,
    };
  }

  return { isValid: true };
}

/**
 * ตรวจสอบ MIME type
 */
export function validateMimeType(mimeType: string): FileValidationResult {
  if (
    !ALLOWED_MIME_TYPES.includes(
      mimeType as (typeof ALLOWED_MIME_TYPES)[number]
    )
  ) {
    return {
      isValid: false,
      error: `MIME type ${mimeType} ไม่ได้รับอนุญาต อนุญาตเฉพาะ ${ALLOWED_MIME_TYPES.join(
        ", "
      )}`,
    };
  }

  return { isValid: true };
}

/**
 * ตรวจสอบขนาดไฟล์
 */
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
 * ตรวจสอบ magic bytes (file signature)
 * ป้องกันการปลอม extension เช่น เปลี่ยน .php เป็น .jpg
 */
export function validateMagicBytes(
  buffer: Buffer,
  expectedMimeType: string
): FileValidationResult {
  const expectedBytes = MAGIC_BYTES[expectedMimeType];

  if (!expectedBytes) {
    return {
      isValid: false,
      error: "ไม่สามารถตรวจสอบประเภทไฟล์ได้",
    };
  }

  // ตรวจสอบว่า bytes แรกตรงกับ signature หรือไม่
  const fileStartBytes = Array.from(buffer.slice(0, expectedBytes.length));
  const isMatch = expectedBytes.every(
    (byte, index) => fileStartBytes[index] === byte
  );

  if (!isMatch) {
    return {
      isValid: false,
      error: "ไฟล์ไม่ตรงกับประเภทที่ระบุ (อาจมีการปลอมแปลงนามสกุลไฟล์)",
    };
  }

  return { isValid: true };
}

/**
 * Sanitize filename เพื่อป้องกัน path traversal และ special characters
 */
export function sanitizeFilename(filename: string): string {
  // ลบ path traversal characters
  let sanitized = filename.replace(/\.\./g, "");

  // เก็บเฉพาะตัวอักษร ตัวเลข - _ และ .
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "_");

  // เพิ่ม timestamp เพื่อป้องกันชื่อซ้ำ
  const ext = sanitized.slice(sanitized.lastIndexOf("."));
  const name = sanitized.slice(0, sanitized.lastIndexOf("."));
  const timestamp = Date.now();

  return `${name}_${timestamp}${ext}`;
}

/**
 * ตรวจสอบไฟล์ upload ทั้งหมด (รวมทุก validation)
 */
export async function validateUploadFile(
  file: File
): Promise<FileValidationResult & { validatedFile?: ValidatedFile }> {
  // 1. ตรวจสอบว่ามีไฟล์หรือไม่
  if (!file || !file.name) {
    return { isValid: false, error: "ไม่พบไฟล์" };
  }

  // 2. ตรวจสอบ extension
  const extResult = validateExtension(file.name);
  if (!extResult.isValid) return extResult;

  // 3. ตรวจสอบ MIME type
  const mimeResult = validateMimeType(file.type);
  if (!mimeResult.isValid) return mimeResult;

  // 4. ตรวจสอบขนาดไฟล์
  const sizeResult = validateFileSize(file.size);
  if (!sizeResult.isValid) return sizeResult;

  // 5. อ่าน buffer และตรวจสอบ magic bytes
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const magicResult = validateMagicBytes(buffer, file.type);
  if (!magicResult.isValid) return magicResult;

  // 6. Sanitize filename
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

/**
 * ตรวจสอบ Buffer โดยตรง (สำหรับกรณีที่ได้ buffer มาแล้ว)
 */
export function validateUploadBuffer(
  buffer: Buffer,
  filename: string,
  mimeType: string
): FileValidationResult & { validatedFile?: ValidatedFile } {
  // 1. ตรวจสอบ extension
  const extResult = validateExtension(filename);
  if (!extResult.isValid) return extResult;

  // 2. ตรวจสอบ MIME type
  const mimeResult = validateMimeType(mimeType);
  if (!mimeResult.isValid) return mimeResult;

  // 3. ตรวจสอบขนาด
  const sizeResult = validateFileSize(buffer.length);
  if (!sizeResult.isValid) return sizeResult;

  // 4. ตรวจสอบ magic bytes
  const magicResult = validateMagicBytes(buffer, mimeType);
  if (!magicResult.isValid) return magicResult;

  // 5. Sanitize filename
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
