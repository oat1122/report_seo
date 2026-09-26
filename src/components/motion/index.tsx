'use client'

/**
 * Motion primitives (motion.dev) — ใช้ร่วมกันทั้งแอป
 * ทุกตัวเคารพ prefers-reduced-motion ผ่าน <MotionConfig reducedMotion="user"> ใน Providers
 */
import React, { useEffect, useRef } from 'react'
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type HTMLMotionProps,
  type Variants,
} from 'motion/react'

export const EASE_OUT = [0.2, 0.8, 0.2, 1] as const

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE_OUT } },
}

/** fade + rise ตอน mount — ใช้กับ section เดี่ยว */
export function Reveal({ delay = 0, ...props }: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: EASE_OUT, delay }}
      {...props}
    />
  )
}

/** container ที่ไล่ลูก (StaggerItem) ขึ้นมาทีละตัว */
export function Stagger({
  gap = 0.06,
  delay = 0,
  ...props
}: HTMLMotionProps<'div'> & { gap?: number; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
      {...props}
    />
  )
}

export function StaggerItem(props: HTMLMotionProps<'div'>) {
  return <motion.div variants={itemVariants} {...props} />
}

/** ตัวเลขนับขึ้นจาก 0 → value เมื่อเข้าจอ (คง tabular-nums ไว้ที่ className ของผู้เรียก) */
export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString('th-TH'),
  duration = 0.9,
  className,
}: {
  value: number
  format?: (n: number) => string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const mv = useMotionValue(reduce ? value : 0)
  const text = useTransform(mv, format)

  useEffect(() => {
    if (!inView) return
    // แท็บซ่อนอยู่ = rAF ไม่เดิน แอนิเมชันจะค้างค่ากลางทาง → ตั้งค่าจริงทันที
    if (reduce || document.visibilityState === 'hidden') {
      mv.set(value)
      return
    }
    const controls = animate(mv, value, { duration, ease: EASE_OUT })
    return () => controls.stop()
  }, [inView, value, duration, reduce, mv])

  return (
    <motion.span ref={ref} className={className}>
      {text}
    </motion.span>
  )
}

/** fade เนื้อหาเมื่อเปลี่ยน route/แท็บ — ส่ง key ที่เปลี่ยนตาม route */
export function FadeSwap({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/** แถบ progress ที่ยืดจาก 0 → value% */
export function GrowBar({
  value,
  className,
  delay = 0,
}: {
  value: number
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ width: 0 }}
      animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay }}
    />
  )
}

export { motion, AnimatePresence, MotionConfig } from 'motion/react'
