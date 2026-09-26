'use client'

import { ClipboardList, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyPlansStateProps {
  onCreate?: () => void
  readOnly?: boolean
}

export function EmptyPlansState({ onCreate, readOnly }: EmptyPlansStateProps) {
  return (
    <div className="border-accent bg-glass-card flex flex-col items-center justify-center gap-4 rounded-[20px] border border-dashed px-6 py-12 text-center">
      <div
        aria-hidden
        className="bg-info-subtle text-info-strong flex size-14 items-center justify-center rounded-[16px]"
      >
        <ClipboardList className="size-6" />
      </div>
      <div className="flex max-w-md flex-col gap-1">
        <h3 className="text-[17px] font-semibold">ยังไม่มีแผนงาน</h3>
        <p className="text-text-secondary text-sm">
          {readOnly
            ? 'ทีมยังไม่ได้เปิดแผนงานให้ดู — เมื่อแผนพร้อม ความคืบหน้าจะแสดงที่นี่'
            : 'สร้างใหม่จากศูนย์ ใช้ template หรือ clone จากแผนเดิม'}
        </p>
      </div>
      {!readOnly && onCreate && (
        <Button onClick={onCreate}>
          <Plus className="size-4" />
          สร้างแผนงาน
        </Button>
      )}
    </div>
  )
}
