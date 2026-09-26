/**
 * File Upload Validation Utility
 * ป้องกันการอัปโหลดไฟล์อันตราย (script/binary/polyglot) ผ่าน magic-byte sniffing
 *
 * รองรับ 2 kind:
 * - IMAGE (default): .jpg/.jpeg/.png (image/jpeg, image/png)
 * - FILE: .pdf/.doc/.docx/.xls/.xlsx (Office + PDF)
 *
 * เพื่อ backward compat: ถ้าไม่ส่ง options.allowedKinds → default = ["IMAGE"]
 * (caller เดิม payments / ai-overview รับเฉพาะ IMAGE จึงไม่ต้องปรับ)
 */

import { fileTypeFromBuffer } from 'file-type'
import crypto from 'crypto'

export type UploadKind = 'IMAGE' | 'FILE'

const IMAGE_EXT = ['.jpg', '.jpeg', '.png'] as const
const IMAGE_MIME = ['image/jpeg', 'image/png'] as const

const FILE_EXT = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'] as const
const FILE_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5MB
const DEFAULT_KINDS: readonly UploadKind[] = ['IMAGE']

export interface ValidateOptions {
  allowedKinds?: readonly UploadKind[]
  maxSizeBytes?: number
}

export interface FileValidationResult {
  isValid: boolean
  error?: string
  sanitizedFilename?: string
}

export interface ValidatedFile {
  buffer: Buffer
  filename: string
  mimeType: string
  size: number
}

function buildAllowedSets(kinds: readonly UploadKind[]): {
  extensions: readonly string[]
  mimeTypes: readonly string[]
} {
  const extensions: string[] = []
  const mimeTypes: string[] = []
  for (const kind of kinds) {
    if (kind === 'IMAGE') {
      extensions.push(...IMAGE_EXT)
      mimeTypes.push(...IMAGE_MIME)
    } else if (kind === 'FILE') {
      extensions.push(...FILE_EXT)
      mimeTypes.push(...FILE_MIME)
    }
  }
  return { extensions, mimeTypes }
}

export function validateExtension(
  filename: string,
  allowedExtensions: readonly string[] = IMAGE_EXT,
): FileValidationResult {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot < 0) {
    return { isValid: false, error: 'ไฟล์ไม่มีนามสกุล' }
  }
  const ext = filename.toLowerCase().slice(lastDot)

  if (!allowedExtensions.includes(ext)) {
    return {
      isValid: false,
      error: `ไฟล์ประเภท ${ext} ไม่ได้รับอนุญาต อนุญาตเฉพาะ ${allowedExtensions.join(', ')}`,
    }
  }

  return { isValid: true }
}

export function validateMimeType(
  mimeType: string,
  allowedMimeTypes: readonly string[] = IMAGE_MIME,
): FileValidationResult {
  if (!allowedMimeTypes.includes(mimeType)) {
    return {
      isValid: false,
      error: `MIME type ${mimeType} ไม่ได้รับอนุญาต`,
    }
  }
  return { isValid: true }
}

export function validateFileSize(
  size: number,
  maxSizeBytes: number = DEFAULT_MAX_SIZE,
): FileValidationResult {
  if (size > maxSizeBytes) {
    const maxSizeMB = maxSizeBytes / (1024 * 1024)
    return {
      isValid: false,
      error: `ไฟล์มีขนาดใหญ่เกินไป (ไม่เกิน ${maxSizeMB}MB)`,
    }
  }
  return { isValid: true }
}

/**
 * sniff ทั้ง container ไม่ใช่แค่ 3 byte แรก ป้องกัน polyglot
 */
export async function validateMagicBytes(
  buffer: Buffer,
  expectedMimeType: string,
  allowedMimeTypes: readonly string[] = IMAGE_MIME,
): Promise<FileValidationResult> {
  const detected = await fileTypeFromBuffer(buffer)

  if (!detected) {
    return {
      isValid: false,
      error: 'ไม่สามารถตรวจสอบประเภทไฟล์ได้',
    }
  }

  // Office DOCX/XLSX มี magic byte เป็น ZIP (PK..) — file-type จะคืน mime ของ office จริงเมื่อ sniff ได้
  // แต่ DOC/XLS เก่า (CFB) อาจคืน mime แยก — ตรวจกับ whitelist ที่อนุญาตเท่านั้น
  if (!allowedMimeTypes.includes(detected.mime)) {
    return {
      isValid: false,
      error: `ประเภทไฟล์จริง ${detected.mime} ไม่ได้รับอนุญาต`,
    }
  }

  if (detected.mime !== expectedMimeType) {
    return {
      isValid: false,
      error: `ไฟล์ไม่ตรงกับประเภทที่ระบุ (พบ ${detected.mime} แต่ต้องการ ${expectedMimeType})`,
    }
  }

  return { isValid: true }
}

// ตัดให้เหลือไม่เกิน maxBytes โดยไม่ผ่ากลาง multi-byte char (ไทย = 3 ไบต์/ตัว)
function truncateBytes(value: string, maxBytes: number): string {
  if (Buffer.byteLength(value, 'utf8') <= maxBytes) return value
  let result = ''
  let bytes = 0
  for (const char of value) {
    const size = Buffer.byteLength(char, 'utf8')
    if (bytes + size > maxBytes) break
    result += char
    bytes += size
  }
  return result
}

/**
 * เก็บอักษรไทย/Unicode ไว้ (ของเดิมแทนที่ด้วย _ หมดจนชื่อกลายเป็นขีดล่างล้วน)
 * แล้วต่อท้ายด้วย timestamp + uuid เพื่อกัน collision ใน ms เดียวกัน
 */
export function sanitizeFilename(filename: string): string {
  // ชื่อจาก macOS มาเป็น NFD — normalize ก่อน ไม่งั้นสระ/วรรณยุกต์แยกตัวกลายเป็นคนละ byte
  let sanitized = filename.normalize('NFC')
  // \p{C} คลุม control + format char รวม RTL-override ที่ใช้ปลอมนามสกุลไฟล์
  sanitized = sanitized.replace(/\p{C}/gu, '')
  // อนุญาตตัวอักษร/combining mark/ตัวเลข/. _ - ที่เหลือ (รวม / \ : * ? " < > | และช่องว่าง) เป็น _
  // \p{M} ขาดไม่ได้ — สระ/วรรณยุกต์ไทย (ิ ั ุ ื ่ ้) เป็น mark ไม่ใช่ letter
  sanitized = sanitized.replace(/[^\p{L}\p{M}\p{N}._-]/gu, '_')
  sanitized = sanitized.replace(/\.\./g, '')
  // จุดนำหน้าทำให้เป็น hidden file บน unix — ตัดทิ้ง
  sanitized = sanitized.replace(/^\.+/, '')

  const lastDot = sanitized.lastIndexOf('.')
  const hasExt = lastDot > 0 && lastDot < sanitized.length - 1
  const ext = hasExt ? sanitized.slice(lastDot) : ''
  const rawName = hasExt ? sanitized.slice(0, lastDot) : sanitized.replace(/\.+$/, '')
  // limit ของ filesystem คือ 255 ไบต์ — กันที่ไว้ให้ suffix (23 ไบต์) + นามสกุล
  const name = truncateBytes(rawName, 255 - 23 - Buffer.byteLength(ext, 'utf8')) || 'file'
  const timestamp = Date.now()
  const unique = crypto.randomUUID().slice(0, 8)

  return `${name}_${timestamp}_${unique}${ext}`
}

export async function validateUploadFile(
  file: File,
  options: ValidateOptions = {},
): Promise<FileValidationResult & { validatedFile?: ValidatedFile }> {
  if (!file || !file.name) {
    return { isValid: false, error: 'ไม่พบไฟล์' }
  }

  const kinds = options.allowedKinds ?? DEFAULT_KINDS
  const { extensions, mimeTypes } = buildAllowedSets(kinds)
  const maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_SIZE

  const extResult = validateExtension(file.name, extensions)
  if (!extResult.isValid) return extResult

  const mimeResult = validateMimeType(file.type, mimeTypes)
  if (!mimeResult.isValid) return mimeResult

  const sizeResult = validateFileSize(file.size, maxSizeBytes)
  if (!sizeResult.isValid) return sizeResult

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const magicResult = await validateMagicBytes(buffer, file.type, mimeTypes)
  if (!magicResult.isValid) return magicResult

  const sanitizedFilename = sanitizeFilename(file.name)

  return {
    isValid: true,
    sanitizedFilename,
    validatedFile: {
      buffer,
      filename: sanitizedFilename,
      mimeType: file.type,
      size: file.size,
    },
  }
}

export async function validateUploadBuffer(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  options: ValidateOptions = {},
): Promise<FileValidationResult & { validatedFile?: ValidatedFile }> {
  const kinds = options.allowedKinds ?? DEFAULT_KINDS
  const { extensions, mimeTypes } = buildAllowedSets(kinds)
  const maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_SIZE

  const extResult = validateExtension(filename, extensions)
  if (!extResult.isValid) return extResult

  const mimeResult = validateMimeType(mimeType, mimeTypes)
  if (!mimeResult.isValid) return mimeResult

  const sizeResult = validateFileSize(buffer.length, maxSizeBytes)
  if (!sizeResult.isValid) return sizeResult

  const magicResult = await validateMagicBytes(buffer, mimeType, mimeTypes)
  if (!magicResult.isValid) return magicResult

  const sanitizedFilename = sanitizeFilename(filename)

  return {
    isValid: true,
    sanitizedFilename,
    validatedFile: {
      buffer,
      filename: sanitizedFilename,
      mimeType,
      size: buffer.length,
    },
  }
}
