'use client'

import { useRef } from 'react'
import { ImagePlus, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUploadPaymentProof } from '../../hooks/usePaymentProofs'

interface UploadProofDialogProps {
  customerId: string
  billingCycleId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadProofDialog({
  customerId,
  billingCycleId,
  open,
  onOpenChange,
}: UploadProofDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadPaymentProof()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    uploadMutation.mutate(
      {
        customerId,
        file,
        billingCycleId: billingCycleId ?? undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      },
    )
    e.target.value = ''
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 overflow-hidden rounded-3xl p-0 max-sm:top-auto max-sm:bottom-0 max-sm:max-w-full max-sm:translate-y-0 max-sm:rounded-b-none sm:max-w-[480px]">
        <DialogHeader className="flex-row items-start gap-3.5 px-6 pt-5.5 pr-14 pb-4 text-left">
          <span
            aria-hidden
            className="bg-info-subtle text-info-strong flex size-11 shrink-0 items-center justify-center rounded-[14px]"
          >
            <ImagePlus className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <DialogTitle className="text-xl leading-snug font-semibold">
              อัปโหลดหลักฐานการโอนเงิน
            </DialogTitle>
            <DialogDescription className="text-text-secondary text-[13px]">
              รูปสลิปโอนเงิน JPG หรือ PNG ขนาดไม่เกิน 5MB
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            aria-label="เลือกรูปสลิป"
            onChange={handleFileSelect}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="border-border hover:border-info focus-visible:ring-ring/60 flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-white/60 px-6 py-8 text-center transition-colors hover:bg-white focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-wait disabled:opacity-70 dark:bg-white/5 dark:hover:bg-white/10"
          >
            {uploadMutation.isPending ? (
              <Loader2 aria-hidden className="text-info-strong size-6 animate-spin" />
            ) : (
              <Upload aria-hidden className="text-info-strong size-6" />
            )}
            <span className="text-sm font-medium">
              {uploadMutation.isPending ? 'กำลังอัปโหลด…' : 'เลือกไฟล์'}
            </span>
            <span className="text-text-secondary text-xs">ทีมจะตรวจสอบแล้วอัปเดตสถานะงวดให้</span>
          </button>
        </div>

        <div className="border-border bg-muted/60 flex justify-end border-t px-6 py-4 dark:bg-white/5">
          <Button
            variant="outline"
            className="h-11 w-full rounded-[12px] px-4 sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            ปิด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
