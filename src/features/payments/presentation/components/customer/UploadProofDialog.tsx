"use client";

import { useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUploadPaymentProof } from "../../hooks/usePaymentProofs";

interface UploadProofDialogProps {
  customerId: string;
  billingCycleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadProofDialog({
  customerId,
  billingCycleId,
  open,
  onOpenChange,
}: UploadProofDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadPaymentProof();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadMutation.mutate(
      {
        customerId,
        file,
        billingCycleId: billingCycleId ?? undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
    e.target.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>อัปโหลดหลักฐานการโอนเงิน</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            เลือกรูปภาพสลิปโอนเงิน (JPG, PNG — ขนาดไม่เกิน 5MB)
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleFileSelect}
          />

          <Button
            className="w-full"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Upload className="mr-2 size-4" />
            )}
            เลือกไฟล์
          </Button>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ปิด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
