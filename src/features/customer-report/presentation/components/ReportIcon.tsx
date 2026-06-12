'use client'

import { Check, Globe, Rocket, TrendingUp, type LucideIcon } from 'lucide-react'
import { AnimatedIcon } from '@/components/shared/AnimatedIcon'
import { cn } from '@/lib/utils'
import type { AnimatedIconName } from '@/components/shared/animatedIconAssets'

// ไอคอนหัวข้อ/โฟกัสของรายงานลูกค้า — รวม animated webp + lucide fallback (reduced-motion) ไว้จุดเดียว
// จำกัดชุดเฉพาะไอคอน animated ที่ "มีจริง" และ map กับคอนเซ็ปต์รายงาน เพื่อกัน 404 + ความไม่สม่ำเสมอ
const ICON_FALLBACK = {
  'trending-up': TrendingUp,
  globe: Globe,
  check: Check,
  rocket: Rocket,
} satisfies Record<string, LucideIcon>

// bg token (ระบายสี mask ของ AnimatedIcon) → text token (สี lucide fallback) ให้ตรงกัน
// เขียน literal เพื่อให้ Tailwind scan เก็บ class ไว้ (กัน purge)
const TONE = {
  'bg-info': 'text-info',
  'bg-success': 'text-success',
  'bg-foreground': 'text-foreground',
  'bg-muted-foreground': 'text-muted-foreground',
  'bg-secondary-foreground': 'text-secondary-foreground',
} satisfies Record<string, string>

type ReportIconName = keyof typeof ICON_FALLBACK & AnimatedIconName

interface ReportIconProps {
  name: ReportIconName
  /** hover = นิ่งจนเอาเมาส์ชี้/focus, loop = เล่นวนตลอด (ใช้กับจุดโฟกัส) */
  trigger: 'hover' | 'loop'
  /** สีไอคอน = bg-* theme token (rule 08) */
  color: keyof typeof TONE
  size?: number
  className?: string
}

export const ReportIcon = ({ name, trigger, color, size = 20, className }: ReportIconProps) => {
  const Fallback = ICON_FALLBACK[name]
  return (
    <AnimatedIcon
      name={name}
      trigger={trigger}
      size={size}
      color={color}
      className={cn('shrink-0', className)}
      fallback={<Fallback size={size} className={cn('shrink-0', TONE[color])} />}
    />
  )
}
