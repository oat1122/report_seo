"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ExternalLink, FileText, Link2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import {
  useAddLinkAttachment,
  useDeleteAttachment,
  useUploadAttachment,
} from "../../hooks/useAttachmentActions";
import type { WorkProgressAttachment } from "@/features/work-progress";

interface AttachmentGalleryProps {
  userId: string;
  planId: string;
  itemId: string;
  attachments: WorkProgressAttachment[];
  readOnly?: boolean;
}

const MAX_SIZE = 5 * 1024 * 1024;

export function AttachmentGallery({
  userId,
  planId,
  itemId,
  attachments,
  readOnly,
}: AttachmentGalleryProps) {
  const uploadMut = useUploadAttachment();
  const linkMut = useAddLinkAttachment();
  const deleteMut = useDeleteAttachment();
  const inputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkCaption, setLinkCaption] = useState("");

  const images = attachments.filter((a) => a.kind === "IMAGE");
  const others = attachments.filter((a) => a.kind !== "IMAGE");

  const handlePick = () => inputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > MAX_SIZE) {
      toast.error("ไฟล์ใหญ่เกิน 5MB");
      return;
    }
    await uploadMut.mutateAsync({ userId, planId, itemId, file: f });
  };

  const handleAddLink = async () => {
    if (!linkUrl.trim()) return;
    await linkMut.mutateAsync({
      userId,
      planId,
      itemId,
      body: { url: linkUrl.trim(), caption: linkCaption.trim() || null },
    });
    setLinkUrl("");
    setLinkCaption("");
  };

  return (
    <div className="flex flex-col gap-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((a) => (
            <div
              key={a.id}
              className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
            >
              <Image
                src={a.url}
                alt={a.caption ?? a.filename ?? "attachment"}
                fill
                sizes="200px"
                className="object-cover"
              />
              {!readOnly && (
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute right-1 top-1 opacity-0 transition group-hover:opacity-100"
                  onClick={() =>
                    deleteMut.mutate({
                      userId,
                      planId,
                      itemId,
                      attachmentId: a.id,
                    })
                  }
                  aria-label="ลบ"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {others.length > 0 && (
        <ul className="flex flex-col gap-1">
          {others.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5"
            >
              {a.kind === "LINK" ? (
                <Link2 className="size-4 text-muted-foreground" />
              ) : (
                <FileText className="size-4 text-muted-foreground" />
              )}
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex-1 truncate text-sm hover:underline"
              >
                {a.caption || a.filename || a.url}
              </a>
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-muted-foreground hover:text-foreground"
                aria-label="เปิด"
              >
                <ExternalLink className="size-3.5" />
              </a>
              {!readOnly && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    deleteMut.mutate({
                      userId,
                      planId,
                      itemId,
                      attachmentId: a.id,
                    })
                  }
                  aria-label="ลบ"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {attachments.length === 0 && (
        <p className="text-xs text-muted-foreground">ยังไม่มีไฟล์ / link</p>
      )}

      {!readOnly && (
        <div className="flex flex-col gap-3 rounded-md border border-dashed border-border bg-muted/20 p-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePick}
              disabled={uploadMut.isPending}
            >
              <Upload className="size-4" />
              อัปโหลดไฟล์
            </Button>
            <span className="text-xs text-muted-foreground">
              สูงสุด 5MB · png/jpg/webp/pdf/doc/xls
            </span>
            <input
              ref={inputRef}
              type="file"
              hidden
              onChange={handleFile}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="att-link" className="text-xs">
              หรือเพิ่ม link
            </Label>
            <Input
              id="att-link"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              maxLength={2000}
              className="h-8"
            />
            <Input
              value={linkCaption}
              onChange={(e) => setLinkCaption(e.target.value)}
              placeholder="คำอธิบาย (optional)"
              maxLength={500}
              className="h-8"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddLink}
              disabled={!linkUrl.trim() || linkMut.isPending}
              className="self-start"
            >
              <Link2 className="size-4" />
              เพิ่ม link
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
