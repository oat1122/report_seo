"use client";

import React, { useState } from "react";
import {
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AiOverview } from "@/types/metrics";

interface AiOverviewCardProps {
  aiOverviews: AiOverview[];
}

const formatThaiLongDate = (iso: string) =>
  new Date(iso).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const AiOverviewCard: React.FC<AiOverviewCardProps> = ({
  aiOverviews,
}) => {
  const [dialogItem, setDialogItem] = useState<AiOverview | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
  };

  const closeLightbox = () => setLightboxImages([]);

  const showPrev = () =>
    setLightboxIndex((p) => (p > 0 ? p - 1 : lightboxImages.length - 1));
  const showNext = () =>
    setLightboxIndex((p) => (p < lightboxImages.length - 1 ? p + 1 : 0));

  if (aiOverviews.length === 0) {
    return (
      <div className="flex h-full flex-col rounded-2xl border border-border p-4 md:p-6">
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="size-5 text-info" />
            AI Overview
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            keyword ที่ถูก AI Search หยิบขึ้นมา
          </p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center">
          <Sparkles className="size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            ยังไม่มี AI Overview ที่บันทึก
          </p>
          <p className="text-xs text-muted-foreground/70">
            เมื่อ keyword ของคุณถูก AI Search หยิบขึ้นมา จะแสดงรูปภาพและข้อมูลที่นี่
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full overflow-hidden rounded-2xl border border-border p-4 md:p-6">
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="size-5 text-info" />
            AI Overview
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {aiOverviews.length} รายการ · keyword ที่ถูก AI Search หยิบขึ้นมา
          </p>
        </div>
        <ul className="-mx-4 divide-y divide-border md:-mx-6">
          {aiOverviews.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 px-4 py-3 transition-all hover:bg-muted hover:shadow-[inset_4px_0_0_var(--info)] md:px-6"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.images.length} รูปภาพ • {formatThaiLongDate(item.displayDate)}
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setDialogItem(item)}
                    aria-label="ดูรูปภาพ"
                  >
                    <Eye className="size-4 text-info" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>ดูรูปภาพ</TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ul>
      </div>

      {/* Item dialog — แสดงทุกรูปของ item */}
      <Dialog open={!!dialogItem} onOpenChange={(o) => !o && setDialogItem(null)}>
        {dialogItem && (
          <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[min(92vw,1024px)]">
            <DialogHeader className="bg-gradient-to-br from-info to-info/70 -m-4 mb-2 rounded-t-xl p-4 text-info-foreground">
              <DialogTitle className="flex items-center gap-2 text-info-foreground">
                <Sparkles className="size-5" />
                {dialogItem.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                รูปภาพประกอบ {dialogItem.title}
              </DialogDescription>
              <Badge className="w-fit gap-1 bg-white/20 text-info-foreground hover:bg-white/30">
                <Calendar className="size-3" />
                {formatThaiLongDate(dialogItem.displayDate)}
              </Badge>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              {dialogItem.images.map((img, idx) => (
                <button
                  type="button"
                  key={img.id}
                  onClick={() =>
                    openLightbox(
                      dialogItem.images.map((i) => i.imageUrl),
                      idx,
                    )
                  }
                  className="overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.imageUrl}
                    alt={`${dialogItem.title} - ${idx + 1}`}
                    className="max-h-96 w-full object-contain"
                  />
                </button>
              ))}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Lightbox — ภาพเต็มจอ */}
      <Dialog open={lightboxImages.length > 0} onOpenChange={(o) => !o && closeLightbox()}>
        <DialogContent
          className="max-h-[95vh] max-w-[95vw] border-none bg-transparent p-0 shadow-none"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">ภาพขยาย</DialogTitle>
          <div className="relative">
            <Button
              size="icon"
              variant="secondary"
              aria-label="ปิด"
              onClick={closeLightbox}
              className="absolute -top-10 right-0 bg-foreground/50 text-background hover:bg-foreground/70"
            >
              <X />
            </Button>

            {lightboxImages.length > 1 && (
              <>
                <Button
                  size="icon-lg"
                  variant="secondary"
                  aria-label="ภาพก่อนหน้า"
                  onClick={showPrev}
                  className="absolute top-1/2 left-2 -translate-y-1/2 bg-foreground/50 text-background hover:bg-foreground/70 md:left-4"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  size="icon-lg"
                  variant="secondary"
                  aria-label="ภาพถัดไป"
                  onClick={showNext}
                  className="absolute top-1/2 right-2 -translate-y-1/2 bg-foreground/50 text-background hover:bg-foreground/70 md:right-4"
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
                className="max-h-[85vh] max-w-[95vw] rounded-lg object-contain"
              />
            )}

            {lightboxImages.length > 1 && (
              <p className="mt-2 text-center text-sm text-background">
                {lightboxIndex + 1} / {lightboxImages.length}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
