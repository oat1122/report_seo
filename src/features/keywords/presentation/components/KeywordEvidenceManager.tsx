'use client'

import React, { useRef } from 'react'
import { Loader2, Trash2, Upload } from 'lucide-react'
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
  const addImages = useAddKeywordImages()
  const deleteImage = useDeleteKeywordImage()
  const isBusy = addImages.isPending || deleteImage.isPending

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return
    if (images.length + files.length > MAX_KEYWORD_EVIDENCE_IMAGES) {
      alert(`อัปโหลดรูปหลักฐานได้สูงสุด ${MAX_KEYWORD_EVIDENCE_IMAGES} รูปต่อ keyword`)
      return
    }
    addImages.mutate({ customerId, keywordId, files })
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        onChange={handleSelect}
        className="hidden"
      />

      {images.map((img) => (
        <div
          key={img.id}
          className="border-border relative size-14 overflow-hidden rounded-md border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.imageUrl} alt="หลักฐานอันดับ" className="size-full object-cover" />
          <button
            type="button"
            disabled={isBusy}
            onClick={() => deleteImage.mutate({ customerId, keywordId, imageId: img.id })}
            aria-label="ลบรูปหลักฐาน"
            className="bg-foreground/55 text-background hover:bg-foreground/70 absolute top-0.5 right-0.5 flex size-5 items-center justify-center rounded-full disabled:opacity-50"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isBusy || images.length >= MAX_KEYWORD_EVIDENCE_IMAGES}
        onClick={() => inputRef.current?.click()}
      >
        {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        หลักฐาน ({images.length}/{MAX_KEYWORD_EVIDENCE_IMAGES})
      </Button>
    </div>
  )
}
