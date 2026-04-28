import { describe, expect, it } from "vitest";
import path from "path";
import {
  buildPublicUrl,
  getUploadDir,
  resolveUploadPath,
} from "@/lib/upload-paths";
import { BadRequestError } from "@/lib/errors";

describe("upload-paths", () => {
  describe("buildPublicUrl", () => {
    it("returns the conventional public URL", () => {
      expect(buildPublicUrl("ai-overview", "image_123.png")).toBe(
        "/uploads/ai-overview/image_123.png",
      );
      expect(buildPublicUrl("payments", "slip_42.jpg")).toBe(
        "/uploads/payments/slip_42.jpg",
      );
    });

    it("rejects filenames containing path separators", () => {
      expect(() => buildPublicUrl("ai-overview", "../etc/passwd")).toThrow(
        BadRequestError,
      );
      expect(() => buildPublicUrl("payments", "sub\\evil.jpg")).toThrow(
        BadRequestError,
      );
    });
  });

  describe("resolveUploadPath", () => {
    it("resolves a normal upload URL into the expected absolute path", () => {
      const resolved = resolveUploadPath(
        "/uploads/ai-overview/image_123.png",
        "ai-overview",
      );
      const expected = path.join(getUploadDir("ai-overview"), "image_123.png");
      expect(resolved).toBe(expected);
    });

    it("rejects path traversal via ../", () => {
      expect(() =>
        resolveUploadPath(
          "/uploads/ai-overview/../../../etc/passwd",
          "ai-overview",
        ),
      ).toThrow(BadRequestError);
    });

    it("rejects absolute escape attempts", () => {
      expect(() =>
        resolveUploadPath("/uploads/payments/../ai-overview/x.png", "payments"),
      ).toThrow(BadRequestError);
    });

    it("rejects empty paths", () => {
      expect(() => resolveUploadPath("", "ai-overview")).toThrow(
        BadRequestError,
      );
    });
  });
});
