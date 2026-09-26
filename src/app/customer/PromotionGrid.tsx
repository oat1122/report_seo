'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Gem, Rocket, Sparkles, ZoomIn } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from '@/components/motion'
import { cn } from '@/lib/utils'
import { PromotionImageDialog } from './PromotionImageDialog'

type Accent = 'info' | 'secondary' | 'primary'

interface PromotionItem {
  src: string
  alt: string
  badge: string
  badgeIcon: React.ReactNode
  accent: Accent
  title: string
  description: string
  recommended?: boolean
}

// แถบสีบน + ป้ายมุมขวา (ตัวอักษรบนพื้นผ่านเกณฑ์ contrast ทั้งสองธีม)
const accentClass: Record<Accent, { bar: string; badge: string }> = {
  info: { bar: 'bg-info-strong', badge: 'bg-info-subtle text-foreground' },
  secondary: { bar: 'bg-secondary', badge: 'bg-secondary text-secondary-foreground' },
  primary: { bar: 'bg-primary', badge: 'bg-primary text-primary-foreground' },
}

const PROMOTIONS: PromotionItem[] = [
  {
    src: '/img/Promotion/Basic.png',
    alt: 'Basic Promotion - แพ็กเกจสำหรับผู้เริ่มต้น',
    badge: 'BASIC',
    badgeIcon: <Gem aria-hidden />,
    accent: 'info',
    title: 'แพ็กเกจเริ่มต้น',
    description: 'เหมาะสำหรับธุรกิจขนาดเล็กที่ต้องการเริ่มต้นทำ SEO',
  },
  {
    src: '/img/Promotion/Business_Pro.png',
    alt: 'Business Pro Promotion - แพ็กเกจสำหรับธุรกิจ',
    badge: 'PRO',
    badgeIcon: <Rocket aria-hidden />,
    accent: 'secondary',
    title: 'แพ็กเกจมืออาชีพ',
    description: 'สำหรับธุรกิจที่ต้องการผลลัพธ์ SEO ที่เห็นผลชัดเจน',
    recommended: true,
  },
  {
    src: '/img/Promotion/Special_number.png',
    alt: 'Special Number Promotion - แพ็กเกจพิเศษ',
    badge: 'SPECIAL',
    badgeIcon: <Sparkles aria-hidden />,
    accent: 'primary',
    title: 'แพ็กเกจพิเศษ',
    description: 'แพ็กเกจสุดพิเศษที่ออกแบบมาเพื่อคุณโดยเฉพาะ',
  },
]

function PromotionCard({ item, onOpen }: { item: PromotionItem; onOpen: () => void }) {
  const a = accentClass[item.accent]

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="h-full">
      <Card className="group relative h-full gap-0 py-0">
        <span aria-hidden className={cn('absolute inset-x-0 top-0 z-10 h-1', a.bar)} />
        <button
          type="button"
          onClick={onOpen}
          aria-label={`ขยายรูปโปรโมชัน ${item.title}`}
          className="focus-visible:ring-ring/70 block w-full outline-none focus-visible:ring-[3px] focus-visible:ring-inset"
        >
          <div className="relative aspect-[5/3] overflow-hidden">
            <Badge className={cn('absolute top-3 right-3 z-10 font-semibold shadow-sm', a.badge)}>
              {item.badgeIcon}
              {item.badge}
            </Badge>

            {item.recommended && (
              <Badge className="bg-secondary text-secondary-foreground absolute top-3 left-3 z-10 font-semibold shadow-sm">
                แนะนำ
              </Badge>
            )}

            {/* Zoom hint on hover / keyboard focus */}
            <div className="bg-foreground/55 pointer-events-none absolute top-1/2 left-1/2 z-10 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
              <ZoomIn aria-hidden className="text-background size-7" />
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

        <CardContent className="flex flex-col gap-1 py-5">
          <h3 className="text-[17px] font-semibold">{item.title}</h3>
          <p className="text-text-secondary text-sm leading-relaxed">{item.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function PromotionGrid() {
  const [openImage, setOpenImage] = useState<string | null>(null)

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 md:gap-[18px] lg:grid-cols-3">
        {PROMOTIONS.map((promo) => (
          <PromotionCard key={promo.src} item={promo} onOpen={() => setOpenImage(promo.src)} />
        ))}
      </div>

      <PromotionImageDialog src={openImage} onClose={() => setOpenImage(null)} />
    </>
  )
}
