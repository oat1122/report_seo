'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from 'lucide-react'

// UI Kit v1.0 (Toast 08) — กระจกสีเข้มเป็นค่าเริ่มต้นทั้ง light/dark · กว้าง 380 มุม 18 · ช่องไอคอน 32 สีตามสถานะ
// ขวาล่างห่างขอบ 24 (มือถือ 16) · ซ้อนสูงสุด 3 ชิ้น · API การเรียก toast() เหมือนเดิม
// ห้ามใส่ relative/w-* ที่ toast — sonner จัดตำแหน่งซ้อนด้วย position:absolute + --width
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="bottom-right"
      offset={24}
      mobileOffset={16}
      gap={8}
      visibleToasts={3}
      duration={4000}
      closeButton
      icons={{
        success: <CircleCheckIcon className="size-[17px]" />,
        info: <InfoIcon className="size-[17px]" />,
        warning: <TriangleAlertIcon className="size-[17px]" />,
        error: <OctagonXIcon className="size-[17px]" />,
        loading: <Loader2Icon className="text-info size-[18px] animate-spin" />,
      }}
      style={{ '--width': '380px' } as React.CSSProperties}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'group/toast bg-toast shadow-toast flex items-start gap-3 overflow-hidden rounded-[18px] border border-white/10 py-3.5 pr-3 pl-3.5 text-white backdrop-blur-md',
          icon: 'group-data-[type=success]/toast:bg-secondary group-data-[type=success]/toast:text-toast group-data-[type=error]/toast:bg-destructive group-data-[type=warning]/toast:bg-warning-accent group-data-[type=warning]/toast:text-toast group-data-[type=info]/toast:bg-info group-data-[type=info]/toast:text-toast group-data-[type=loading]/toast:bg-info/15 m-0! flex size-8! shrink-0 items-center justify-center rounded-[10px] text-white',
          content: 'flex min-w-0 flex-1 flex-col gap-[3px] pt-px',
          title: 'text-sm leading-snug font-semibold',
          description: 'text-[13px] leading-snug text-white/70',
          actionButton:
            'group-data-[type=error]/toast:text-white group-data-[type=warning]/toast:text-warning-accent text-secondary h-8 shrink-0 cursor-pointer rounded-[10px] bg-white/12 px-3 text-[13px] font-medium hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none',
          cancelButton:
            'h-8 shrink-0 cursor-pointer rounded-[10px] px-3 text-[13px] text-white/70 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none',
          closeButton:
            'static! order-last flex size-7! shrink-0 cursor-pointer items-center justify-center rounded-[9px] border-0! bg-transparent! text-white/55 transform-none! hover:bg-white/10! hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
