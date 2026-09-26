'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  /** ปลายทางเมื่อไม่มีประวัติย้อนกลับในแอป (เปิดหน้าตรง ๆ / refresh) */
  fallbackHref?: string
}

export function BackButton({ fallbackHref = '/admin' }: Props) {
  const router = useRouter()

  const handleBack = () => {
    // Next.js เก็บตำแหน่งใน history stack ไว้ที่ state.idx — idx 0 = ไม่มีหน้าก่อนหน้าในแอป
    const idx = typeof window !== 'undefined' ? window.history.state?.idx : undefined
    if (typeof idx === 'number' && idx > 0) {
      router.back()
    } else {
      router.push(fallbackHref)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleBack}
      aria-label="ย้อนกลับ"
      title="ย้อนกลับ"
      className="border-glass-border shrink-0 rounded-[14px] bg-white/60 backdrop-blur-md hover:bg-white/85 dark:bg-white/5 dark:hover:bg-white/10"
    >
      <ArrowLeft aria-hidden className="size-[18px]" />
    </Button>
  )
}
