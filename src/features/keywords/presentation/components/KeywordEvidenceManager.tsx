'use client'

import React, { useRef, useState } from 'react'
import { Loader2, Trash2, Upload } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import type { KeywordReportImage } from '@/types/metrics'
import { MAX_KEYWORD_EVIDENCE_IMAGES } from '../../schemas'
import { useAddKeywordImages, useDeleteKeywordImage } from '../hooks/useKeywords'

interface KeywordEvidenceManagerProps {
  customerId: string
  keywordId: string
  images: KeywordReportImage[]
}

// อัปโหลด/ลบรูปหลักฐานราย keyword — self-contained ใช้ hook ของตัวเอง (invalidate ครบใน hook)
export const KeywordEvidenceManager: React.FC<KeywordEvidenceManagerProps> = ({
  customerId,
  keywordId,
  images,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [limitError, setLimitError] = useState(false)
  // index ของรูปที่รอยืนยันลบ (null = ปิด dialog)
  const [pendingIndex, setPendingIndex] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const addImages = useAddKeywordImages()
  const deleteImage = useDeleteKeywordImage()
  const isBusy = addImages.isPending || deleteImage.isPending

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return
    if (images.length + files.length > MAX_KEYWORD_EVIDENCE_IMAGES) {
      setLimitError(true)
      return
    }
    setLimitError(false)
    addImages.mutate({ customerId, keywordId, files })
  }

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          onChange={handleSelect}
          tabIndex={-1}
          aria-hidden
          className="hidden"
        />

        {images.map((img, i) => (
          <div key={img.id} className="relative size-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.imageUrl}
              alt={`หลักฐานอันดับรูปที่ ${i + 1}`}
              className="border-border size-full rounded-[10px] border object-cover"
            />
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                setPendingIndex(i)
                setConfirmOpen(true)
              }}
              aria-label={`ลบรูปหลักฐานที่ ${i + 1}`}
              className="bg-foreground/60 text-background hover:bg-foreground/75 focus-visible:ring-ring/70 absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full outline-none after:absolute after:-inset-2 focus-visible:ring-[3px] disabled:opacity-50"
            >
              <Trash2 aria-hidden className="size-3" />
            </button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isBusy || images.length >= MAX_KEYWORD_EVIDENCE_IMAGES}
          onClick={() => inputRef.current?.click()}
          className="max-sm:h-11"
        >
          {isBusy ? <Loader2 className="animate-spin" /> : <Upload />}
          {isBusy
            ? 'กำลังอัปโหลด...'
            : `เพิ่มรูปหลักฐาน (${images.length}/${MAX_KEYWORD_EVIDENCE_IMAGES})`}
        </Button>
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:max-w-none! max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none">
          <AlertDialogHeader>
            <AlertDialogMedia variant="destructive">
              <Trash2 aria-hidden />
            </AlertDialogMedia>
            <AlertDialogTitle>ลบรูปหลักฐานที่ {(pendingIndex ?? 0) + 1}?</AlertDialogTitle>
            <AlertDialogDescription>
              ลูกค้าจะไม่เห็นรูปนี้เป็นหลักฐานอันดับของ keyword นี้อีก และลบแล้วกู้คืนไม่ได้
              ต้องอัปโหลดใหม่หากต้องการ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                const target = pendingIndex === null ? undefined : images[pendingIndex]
                if (!target) return
                setLimitError(false)
                deleteImage.mutate({ customerId, keywordId, imageId: target.id })
              }}
            >
              ลบรูป
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {limitError && (
        <p role="alert" className="text-danger-strong text-xs">
          อัปโหลดรูปหลักฐานได้สูงสุด {MAX_KEYWORD_EVIDENCE_IMAGES} รูปต่อ keyword —
          ลบรูปเดิมก่อนแล้วค่อยเพิ่มใหม่
        </p>
      )}
    </div>
  )
}
