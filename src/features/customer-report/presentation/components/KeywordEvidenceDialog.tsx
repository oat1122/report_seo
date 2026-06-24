'use client'

import React, { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface EvidenceImage {
  id: string
  imageUrl: string
}

interface KeywordEvidenceDialogProps {
  keyword: string
  images: EvidenceImage[]
}

// ปุ่ม "หลักฐาน" บนการ์ด keyword ฝั่งลูกค้า — เปิด dialog ดูรูปหลักฐานอันดับ
export const KeywordEvidenceDialog: React.FC<KeywordEvidenceDialogProps> = ({
  keyword,
  images,
}) => {
  const [open, setOpen] = useState(false)
  if (images.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="border-info/30 bg-info/10 text-info hover:bg-info/20 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors"
        >
          <ImageIcon className="size-3.5" />
          หลักฐาน {images.length}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[min(92vw,1024px)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="text-info size-5" />
            หลักฐานอันดับ · {keyword}
          </DialogTitle>
          <DialogDescription>รูปหลักฐานการจัดอันดับของคีย์เวิร์ดนี้</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {images.map((img, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.id}
              src={img.imageUrl}
              alt={`${keyword} - หลักฐาน ${idx + 1}`}
              className="border-border bg-card max-h-[70vh] w-full rounded-lg border object-contain"
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
