import { cn } from '@/lib/utils'

// UI Kit v1.0 — ย้อมม่วงอ่อน + shimmer 1.4s (ปิดเมื่อผู้ใช้ตั้ง reduced motion)
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'from-info-subtle via-info-subtle/40 to-info-subtle animate-shimmer rounded-md bg-linear-to-r bg-size-[200%_100%] motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
