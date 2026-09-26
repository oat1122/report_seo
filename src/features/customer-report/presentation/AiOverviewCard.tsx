'use client'

import React, { useState } from 'react'
import { Sparkles, X, ChevronDown, ChevronLeft, ChevronRight, Eye, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AiOverview } from '@/types/metrics'
import { ReportCard } from './keywords/ReportCard'

interface AiOverviewCardProps {
  aiOverviews: AiOverview[]
}

const INITIAL_VISIBLE = 8

// "24 ก.ย. 2026" — ปี ค.ศ. ตามกฎ Handoff 04 ข้อ 8
const formatThaiDate = (iso: string) =>
  new Date(iso).toLocaleDateString('th-TH-u-ca-gregory', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

/** ภาพย่อ: ใช้รูปหลักฐานจริงรูปแรก — ไม่มีรูปก็แสดงป้าย AI Overview บนพื้นไล่ม่วง */
const Thumbnail = ({ item, className }: { item: AiOverview; className?: string }) => {
  const first = item.images[0]?.imageUrl
  return (
    <span
      aria-hidden="true"
      className={cn(
        'border-border from-background to-info-subtle relative flex overflow-hidden rounded-xl border bg-linear-to-br',
        className,
      )}
    >
      {first ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={first} alt="" loading="lazy" className="size-full object-cover object-top" />
      ) : (
        <span className="text-info-strong m-auto flex items-center gap-1 text-[11px] font-medium">
          <Sparkles className="size-3.5" />
          AI Overview
        </span>
      )}
    </span>
  )
}

export const AiOverviewCard: React.FC<AiOverviewCardProps> = ({ aiOverviews }) => {
  const [dialogItem, setDialogItem] = useState<AiOverview | null>(null)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [showAll, setShowAll] = useState(false)

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images)
    setLightboxIndex(index)
  }

  const closeLightbox = () => setLightboxImages([])

  const showPrev = () => setLightboxIndex((p) => (p > 0 ? p - 1 : lightboxImages.length - 1))
  const showNext = () => setLightboxIndex((p) => (p < lightboxImages.length - 1 ? p + 1 : 0))

  if (aiOverviews.length === 0) {
    return (
      <ReportCard title="AI Overview" description="keyword ที่ถูก AI Search หยิบขึ้นมา">
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
          <Sparkles className="text-muted-foreground size-8" aria-hidden="true" />
          <p className="text-sm">ยังไม่มี AI Overview ที่บันทึก</p>
          <p className="text-text-secondary max-w-sm text-[13px]">
            เมื่อ keyword ของคุณถูก AI Search หยิบขึ้นมา จะแสดงรูปภาพและข้อมูลที่นี่
          </p>
        </div>
      </ReportCard>
    )
  }

  const visible = showAll ? aiOverviews : aiOverviews.slice(0, INITIAL_VISIBLE)
  const hasMore = aiOverviews.length > INITIAL_VISIBLE

  return (
    <>
      <ReportCard
        title="AI Overview"
        description={`${aiOverviews.length} รายการ · keyword ที่ถูก AI Search หยิบขึ้นมา พร้อมรูปหลักฐาน`}
        action={
          hasMore ? (
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={showAll}
              onClick={() => setShowAll((v) => !v)}
              className="hidden sm:inline-flex"
            >
              {showAll ? 'แสดงน้อยลง' : `ดูทั้งหมด ${aiOverviews.length} รายการ`}
              <ChevronDown
                aria-hidden="true"
                className={cn('transition-transform', showAll && 'rotate-180')}
              />
            </Button>
          ) : undefined
        }
      >
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
          {visible.map((item) => {
            const meta = `${item.images.length} รูปภาพ • ${formatThaiDate(item.displayDate)}`
            return (
              <li key={item.id} className="min-w-0">
                {/* มือถือ: แถว thumb 64 + ข้อความ + ปุ่มไอคอน 44 */}
                <article className="bg-glass-tile grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] p-2 sm:hidden">
                  <Thumbnail item={item} className="h-12" />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h3 className="truncate text-sm font-medium" title={item.title}>
                      {item.title}
                    </h3>
                    <span className="text-text-secondary text-xs tabular-nums">{meta}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDialogItem(item)}
                    aria-label={`ดูรูปภาพ ${item.title}`}
                  >
                    <Eye aria-hidden="true" />
                  </Button>
                </article>

                {/* sm ขึ้นไป: การ์ดแกลเลอรี */}
                <article className="bg-glass-tile border-glass-border hidden h-full flex-col gap-2.5 rounded-2xl border p-3 sm:flex">
                  <Thumbnail item={item} className="h-[120px]" />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h3 className="truncate text-sm font-medium" title={item.title}>
                      {item.title}
                    </h3>
                    <span className="text-text-secondary text-xs tabular-nums">{meta}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDialogItem(item)}
                    className="mt-auto h-10 w-full"
                    aria-label={`ดูรูปภาพ ${item.title}`}
                  >
                    <Eye aria-hidden="true" />
                    ดูรูปภาพ
                  </Button>
                </article>
              </li>
            )
          })}
        </ul>

        {hasMore && (
          <button
            type="button"
            aria-expanded={showAll}
            onClick={() => setShowAll((v) => !v)}
            className="bg-info-subtle focus-visible:ring-ring/70 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-[14px] text-sm font-medium outline-none focus-visible:ring-[3px] sm:hidden"
          >
            {showAll ? 'แสดงน้อยลง' : `ดูทั้งหมด ${aiOverviews.length} รายการ`}
            <ChevronDown
              aria-hidden="true"
              className={cn('size-4 transition-transform', showAll && 'rotate-180')}
            />
          </button>
        )}
      </ReportCard>

      {/* Item dialog — แสดงทุกรูปของ item (มือถือ = bottom sheet) */}
      <Dialog open={!!dialogItem} onOpenChange={(o) => !o && setDialogItem(null)}>
        {dialogItem && (
          <DialogContent size="lg" className="max-h-[92vh] overflow-y-auto">
            <DialogHeader className="gap-2">
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="text-info-strong size-5 shrink-0" aria-hidden="true" />
                <span className="min-w-0 break-words">{dialogItem.title}</span>
              </DialogTitle>
              <DialogDescription className="sr-only">
                รูปภาพประกอบ {dialogItem.title}
              </DialogDescription>
              <Badge variant="info" className="tabular-nums">
                <Calendar aria-hidden="true" />
                {formatThaiDate(dialogItem.displayDate)}
              </Badge>
            </DialogHeader>

            <ul className="flex flex-col gap-3">
              {dialogItem.images.map((img, idx) => (
                <li key={img.id}>
                  <button
                    type="button"
                    onClick={() =>
                      openLightbox(
                        dialogItem.images.map((i) => i.imageUrl),
                        idx,
                      )
                    }
                    aria-label={`ขยายรูปที่ ${idx + 1}`}
                    className="border-border bg-card focus-visible:ring-ring/70 block w-full overflow-hidden rounded-2xl border transition-shadow outline-none hover:shadow-md focus-visible:ring-[3px]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.imageUrl}
                      alt={`${dialogItem.title} - ${idx + 1}`}
                      className="max-h-96 w-full object-contain"
                    />
                  </button>
                </li>
              ))}
            </ul>

            <DialogFooter className="max-sm:rounded-b-none">
              <DialogClose asChild>
                <Button variant="outline">ปิด</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Lightbox — ภาพเต็มจอ */}
      <Dialog open={lightboxImages.length > 0} onOpenChange={(o) => !o && closeLightbox()}>
        <DialogContent
          className="max-h-[95vh] max-w-[95vw] border-none bg-transparent p-0 shadow-none! max-sm:top-1/2 max-sm:bottom-auto max-sm:left-1/2 max-sm:max-w-[95vw] max-sm:-translate-x-1/2 max-sm:-translate-y-1/2 max-sm:overflow-visible max-sm:rounded-[24px] max-sm:p-0 sm:max-w-[95vw] dark:bg-transparent"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">ภาพขยาย</DialogTitle>
          <div className="relative">
            <Button
              size="icon"
              variant="secondary"
              aria-label="ปิด"
              onClick={closeLightbox}
              className="bg-foreground/60 text-background hover:bg-foreground/80 absolute -top-12 right-0"
            >
              <X />
            </Button>

            {lightboxImages.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="secondary"
                  aria-label="ภาพก่อนหน้า"
                  onClick={showPrev}
                  className="bg-foreground/60 text-background hover:bg-foreground/80 absolute top-1/2 left-2 -translate-y-1/2 md:left-4"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  aria-label="ภาพถัดไป"
                  onClick={showNext}
                  className="bg-foreground/60 text-background hover:bg-foreground/80 absolute top-1/2 right-2 -translate-y-1/2 md:right-4"
                >
                  <ChevronRight />
                </Button>
              </>
            )}

            {lightboxImages[lightboxIndex] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lightboxImages[lightboxIndex]}
                alt="AI Overview"
                className="max-h-[85vh] max-w-[95vw] rounded-2xl object-contain"
              />
            )}

            {lightboxImages.length > 1 && (
              <p className="mt-3 text-center">
                <span className="bg-foreground/70 text-background rounded-full px-3 py-1 text-sm tabular-nums">
                  {lightboxIndex + 1} / {lightboxImages.length}
                </span>
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
