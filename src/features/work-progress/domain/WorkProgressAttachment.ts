export type AttachmentKind = "IMAGE" | "FILE" | "LINK";

export interface WorkProgressAttachment {
  id: string;
  itemId: string;
  kind: AttachmentKind;
  url: string;
  filename: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  caption: string | null;
  uploadedById: string | null;
  createdAt: Date;
}
