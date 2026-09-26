'use client'

import React, { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface EvidenceImage {
  id: string
  imageUrl: string
}

interface KeywordEvidenceDialogProps {
  keyword: string
  images: EvidenceImage[]
  /** ปรับขนาดปุ่มเปิด เช่น แถวบนมือถือใช้ h-11 ให้แตะง่าย */
  className?: string
}

// ปุ่ม "หลักฐาน" บนการ์ด keyword ฝั่งลูกค้า — เปิด dialog ดูรูปหลักฐานอันดับ
// มือถือ = bottom sheet (กฎ Handoff 04 ข้อ 11)
export const KeywordEvidenceDialog: React.FC<KeywordEvidenceDialogProps> = ({
  keyword,
  images,
  className,
}) => {
  const [open, setOpen] = useState(false)
  if (images.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`ดูหลักฐานอันดับ ${images.length} รูป`}
          title="ดูหลักฐานอันดับ"
          className={cn(
            'border-border text-foreground hover:bg-info-subtle focus-visible:ring-ring/70 inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-[10px] border bg-white/85 px-2.5 text-xs font-medium tabular-nums transition-colors outline-none focus-visible:ring-[3px] dark:bg-white/5 dark:hover:bg-white/10',
            className,
          )}
        >
          <ImageIcon className="size-3.5" aria-hidden="true" />
          {images.length}
        </button>
      </DialogTrigger>
      <DialogContent size="lg" className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="text-info-strong size-5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words">หลักฐานอันดับ · {keyword}</span>
          </DialogTitle>
          <DialogDescription>
            รูปหลักฐานการจัดอันดับของคีย์เวิร์ดนี้ · {images.length} รูป
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-3">
          {images.map((img, idx) => (
            <li key={img.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.imageUrl}
                alt={`${keyword} - หลักฐาน ${idx + 1}`}
                className="border-border bg-card max-h-[70vh] w-full rounded-2xl border object-contain"
              />
            </li>
          ))}
        </ul>

        <DialogFooter className="max-sm:rounded-b-none">
          <DialogClose asChild>
            <Button variant="outline">ปิด</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
