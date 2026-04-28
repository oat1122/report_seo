import path from "path";
import { BadRequestError } from "@/lib/errors";

export const UPLOAD_DIRS = {
  "ai-overview": "ai-overview",
  payments: "payments",
} as const;

export type UploadCategory = keyof typeof UPLOAD_DIRS;

const PUBLIC_ROOT = path.resolve(process.cwd(), "public");
const UPLOAD_ROOT = path.resolve(PUBLIC_ROOT, "uploads");

export function getUploadDir(category: UploadCategory): string {
  return path.resolve(UPLOAD_ROOT, UPLOAD_DIRS[category]);
}

export function buildPublicUrl(
  category: UploadCategory,
  filename: string,
): string {
  if (filename.includes("/") || filename.includes("\\")) {
    throw new BadRequestError("Invalid filename");
  }
  return `/uploads/${UPLOAD_DIRS[category]}/${filename}`;
}

export function resolveUploadPath(
  relativeUrl: string,
  category: UploadCategory,
): string {
  if (typeof relativeUrl !== "string" || relativeUrl.length === 0) {
    throw new BadRequestError("Empty upload path");
  }

  const trimmed = relativeUrl.startsWith("/")
    ? relativeUrl.slice(1)
    : relativeUrl;
  const resolved = path.resolve(PUBLIC_ROOT, trimmed);

  const expectedDir = getUploadDir(category);
  if (!resolved.startsWith(expectedDir + path.sep) && resolved !== expectedDir) {
    throw new BadRequestError("Upload path escapes upload directory");
  }

  return resolved;
}
