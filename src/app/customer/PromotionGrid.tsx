"use client";

import { useState } from "react";
import Image from "next/image";
import { Gem, Rocket, Sparkles, ZoomIn } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PromotionImageDialog } from "./PromotionImageDialog";

type Accent = "info" | "secondary" | "primary";

interface PromotionItem {
  src: string;
  alt: string;
  badge: string;
  badgeIcon: React.ReactNode;
  accent: Accent;
  title: string;
  description: string;
  recommended?: boolean;
}

const accentClass: Record<
  Accent,
  {
    bar: string;
    badgeBg: string;
    badgeText: string;
    title: string;
    hoverBorder: string;
  }
> = {
  info: {
    bar: "bg-info",
    badgeBg: "bg-info",
    badgeText: "text-info-foreground",
    title: "text-info",
    hoverBorder: "hover:border-info focus-within:border-info",
  },
  secondary: {
    bar: "bg-secondary",
    badgeBg: "bg-secondary",
    badgeText: "text-secondary-foreground",
    title: "text-success",
    hoverBorder: "hover:border-secondary focus-within:border-secondary",
  },
  primary: {
    bar: "bg-primary",
    badgeBg: "bg-primary",
    badgeText: "text-primary-foreground",
    title: "text-primary",
    hoverBorder: "hover:border-primary focus-within:border-primary",
  },
};

const PROMOTIONS: PromotionItem[] = [
  {
    src: "/img/Promotion/Basic.png",
    alt: "Basic Promotion - แพ็กเกจสำหรับผู้เริ่มต้น",
    badge: "BASIC",
    badgeIcon: <Gem className="size-4" />,
    accent: "info",
    title: "แพ็กเกจเริ่มต้น",
    description: "เหมาะสำหรับธุรกิจขนาดเล็กที่ต้องการเริ่มต้นทำ SEO",
  },
  {
    src: "/img/Promotion/Business_Pro.png",
    alt: "Business Pro Promotion - แพ็กเกจสำหรับธุรกิจ",
    badge: "PRO",
    badgeIcon: <Rocket className="size-4" />,
    accent: "secondary",
    title: "แพ็กเกจมืออาชีพ",
    description: "สำหรับธุรกิจที่ต้องการผลลัพธ์ SEO ที่เห็นผลชัดเจน",
    recommended: true,
  },
  {
    src: "/img/Promotion/Special_number.png",
    alt: "Special Number Promotion - แพ็กเกจพิเศษ",
    badge: "SPECIAL",
    badgeIcon: <Sparkles className="size-4" />,
    accent: "primary",
    title: "แพ็กเกจพิเศษ",
    description: "แพ็กเกจสุดพิเศษที่ออกแบบมาเพื่อคุณโดยเฉพาะ",
  },
];

function PromotionCard({
  item,
  onOpen,
}: {
  item: PromotionItem;
  onOpen: () => void;
}) {
  const a = accentClass[item.accent];

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border-2 transition-shadow",
        a.hoverBorder,
      )}
    >
      <span className={cn("absolute inset-x-0 top-0 z-10 h-1", a.bar)} />
      <button
        type="button"
        onClick={onOpen}
        aria-label={`ขยายรูปโปรโมชัน ${item.title}`}
        className="block w-full"
      >
        <div className="relative aspect-[5/3] overflow-hidden">
          <Badge
            className={cn(
              "absolute top-3 right-3 z-10 gap-1 px-3 py-1 font-bold shadow-md",
              a.badgeBg,
              a.badgeText,
            )}
          >
            {item.badgeIcon}
            {item.badge}
          </Badge>

          {item.recommended && (
            <Badge className="absolute top-3 left-3 z-10 animate-pulse bg-secondary px-2 py-1 text-xs font-extrabold text-secondary-foreground">
              แนะนำ
            </Badge>
          )}

          {/* Zoom overlay on hover */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-foreground/55 opacity-0 transition-opacity group-hover:opacity-100">
            <ZoomIn className="size-7 text-background" />
          </div>

          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      </button>

      <CardContent className="p-5">
        <h3 className={cn("mb-1 text-lg font-bold", a.title)}>{item.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      </CardContent>
    </Card>
  );
}

export default function PromotionGrid() {
  const [openImage, setOpenImage] = useState<string | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROMOTIONS.map((promo) => (
          <PromotionCard
            key={promo.src}
            item={promo}
            onOpen={() => setOpenImage(promo.src)}
          />
        ))}
      </div>

      <PromotionImageDialog
        src={openImage}
        onClose={() => setOpenImage(null)}
      />
    </>
  );
}
