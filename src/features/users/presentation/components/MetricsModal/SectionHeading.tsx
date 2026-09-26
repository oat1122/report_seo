import type { ReactNode } from 'react'

interface SectionHeadingProps {
  title: string
  description: string
  /** ปุ่ม action ชิดขวา (มือถือเรียงใต้หัวข้อ) */
  children?: ReactNode
}

/** หัวหมวดในหน้าข้อมูล Domain — h2 + คำอธิบาย + ปุ่ม */
export function SectionHeading({ title, description, children }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-text-secondary text-[13px]">{description}</p>
      </div>
      {children && <div className="flex flex-wrap gap-2.5">{children}</div>}
    </div>
  )
}
