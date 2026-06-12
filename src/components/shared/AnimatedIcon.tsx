'use client'

import { type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/ui/usePrefersReducedMotion'
import { ANIMATED_ICONS, type AnimatedIconName } from './animatedIconAssets'

// asset เป็น webp โปร่งใส (silhouette ที่ key พื้นหลังขาวออกแล้ว) → ระบายสีด้วย CSS mask
// + background-color จาก theme token (เช่น bg-foreground / bg-info) สีจึงมาจาก token จริง
// ไม่มี hex hardcode และ dark mode ปรับเองตาม token (ไม่ต้องใช้ filter/invert)
const maskStyle = (src: string, size: number): CSSProperties => ({
  width: size,
  height: size,
  maskImage: `url(${src})`,
  WebkitMaskImage: `url(${src})`,
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  WebkitMaskPosition: 'center',
  maskSize: 'contain',
  WebkitMaskSize: 'contain',
})

type AnimatedIconTrigger = 'hover' | 'loop'

interface AnimatedIconProps {
  /** ชื่อไอคอนจาก registry ([animatedIconAssets](./animatedIconAssets.ts)) — type-safe, ผูกกับ asset ที่ bundle แล้ว */
  name: AnimatedIconName
  /** hover = นิ่ง (still) จนกว่า element ที่ครอบ (group) จะ hover/focus; loop = เล่นวนตลอด */
  trigger: AnimatedIconTrigger
  /** ความกว้าง/สูงเป็น px */
  size: number
  /** lucide element พร้อม render — แสดงแทนเมื่อ prefers-reduced-motion */
  fallback: ReactNode
  /** Tailwind bg-* theme token = สีไอคอน (เช่น 'bg-foreground', 'bg-info', 'bg-primary-foreground') */
  color?: string
  className?: string
  /** ถ้าไอคอนสื่อความหมายเอง (ไม่มี text กำกับ) → ใส่เพื่อ a11y; default = decorative */
  label?: string
}

export const AnimatedIcon = ({
  name,
  trigger,
  size,
  fallback,
  color = 'bg-foreground',
  className,
  label,
}: AnimatedIconProps) => {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (prefersReducedMotion) {
    return <>{fallback}</>
  }

  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const }

  const asset = ANIMATED_ICONS[name]

  if (trigger === 'loop') {
    return (
      <span
        className={cn('inline-block shrink-0', color, className)}
        style={maskStyle(asset.animated, size)}
        {...a11y}
      />
    )
  }

  return (
    <span className={cn('group inline-grid shrink-0', className)} {...a11y}>
      <span
        aria-hidden
        className={cn(
          'col-start-1 row-start-1 transition-opacity duration-200',
          'group-hover:opacity-0 group-focus-within:opacity-0',
          color,
        )}
        style={maskStyle(asset.still ?? asset.animated, size)}
      />
      <span
        aria-hidden
        className={cn(
          'col-start-1 row-start-1 opacity-0 transition-opacity duration-200',
          'group-hover:opacity-100 group-focus-within:opacity-100',
          color,
        )}
        style={maskStyle(asset.animated, size)}
      />
    </span>
  )
}
