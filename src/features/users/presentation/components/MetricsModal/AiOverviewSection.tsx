'use client'

import React, { useState } from 'react'
import { ImageIcon, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatePresence, EASE_OUT, motion } from '@/components/motion'
import type { AiOverview } from '@/types/metrics'
import { AiOverviewFormDialog } from './AiOverviewFormDialog'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { SectionHeading } from './SectionHeading'
import { formatThaiDate } from './domainFormat'

interface AiOverviewSectionProps {
  aiOverviews: AiOverview[]
  isLoading: boolean
  customerName: string
  onAdd: (formData: FormData) => Promise<void>
  onUpdate: (id: string, formData: FormData) => Promise<void>
  onDelete: (aiOverviewId: string) => Promise<void>
}

/** หมวด AI Overview — รายการหลักฐาน + dialog เพิ่ม/แก้ไข + ยืนยันลบ */
export function AiOverviewSection({
  aiOverviews,
  isLoading,
  customerName,
  onAdd,
  onUpdate,
  onDelete,
}: AiOverviewSectionProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [formItem, setFormItem] = useState<AiOverview | null>(null)
  // key ใหม่ทุกครั้งที่เปิด → ฟอร์มเริ่มจากค่าของรายการนั้นเสมอ
  const [formKey, setFormKey] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<AiOverview | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const openForm = (item: AiOverview | null) => {
    setFormItem(item)
    setFormKey((k) => k + 1)
    setFormOpen(true)
  }

  const handleSubmit = (formData: FormData, id: string | null) =>
    id ? onUpdate(id, formData) : onAdd(formData)

  const confirmDelete = () => {
    if (!deleteTarget) return
    void onDelete(deleteTarget.id)
    setDeleteOpen(false)
  }

  return (
    <>
      <SectionHeading
        title="AI Overview"
        description="บันทึกหัวข้อและภาพประกอบที่ติด AI Overview (สูงสุด 3 รูปต่อรายการ)"
      >
        <Button onClick={() => openForm(null)}>
          <Plus />
          เพิ่ม AI Overview
        </Button>
      </SectionHeading>

      {isLoading ? (
        <div
          className="grid grid-cols-1 gap-3.5 @2xl:grid-cols-2"
          aria-busy="true"
          aria-label="กำลังโหลด AI Overview"
        >
          <Skeleton className="h-56 w-full rounded-[20px]" />
          <Skeleton className="h-56 w-full rounded-[20px]" />
        </div>
      ) : aiOverviews.length === 0 ? (
        <div className="bg-glass-card border-glass-border shadow-card flex flex-col items-center gap-2 rounded-[20px] border px-6 py-10 text-center backdrop-blur-[14px]">
          <span
            aria-hidden
            className="bg-info-subtle text-info-strong flex size-11 items-center justify-center rounded-[14px]"
          >
            <Sparkles className="size-5" />
          </span>
          <p className="font-medium">ยังไม่มี AI Overview</p>
          <p className="text-text-secondary max-w-md text-[13px]">
            เมื่อเว็บลูกค้าถูก AI Search หยิบไปตอบ ให้บันทึกหัวข้อพร้อมภาพหน้าจอเป็นหลักฐานไว้ที่นี่
          </p>
          <Button variant="outline" className="mt-2" onClick={() => openForm(null)}>
            <Plus />
            เพิ่มรายการแรก
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3.5 @2xl:grid-cols-2">
          <AnimatePresence initial={false}>
            {aiOverviews.map((item) => (
              <motion.li
                key={item.id}
                layout="position"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24, ease: EASE_OUT }}
                className="bg-glass-card border-glass-border shadow-card flex flex-col gap-3 rounded-[20px] border p-4 backdrop-blur-[14px]"
              >
                {item.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {item.images.map((img, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={img.id}
                        src={img.imageUrl}
                        alt={`${item.title} รูปที่ ${i + 1}`}
                        className="border-border aspect-[4/3] w-full rounded-xl border object-cover"
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h3 className="font-medium break-words">{item.title}</h3>
                    <p className="text-text-secondary text-xs">
                      แสดงผล {formatThaiDate(item.displayDate)}
                    </p>
                  </div>
                  <Badge variant="info">
                    <ImageIcon aria-hidden />
                    {item.images.length} รูป
                  </Badge>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openForm(item)}
                    aria-label={`แก้ไข ${item.title}`}
                    className="max-sm:h-11"
                  >
                    <Pencil />
                    แก้ไข
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive-subtle"
                    onClick={() => {
                      setDeleteTarget(item)
                      setDeleteOpen(true)
                    }}
                    aria-label={`ลบ ${item.title}`}
                    className="max-sm:h-11"
                  >
                    <Trash2 />
                    ลบ
                  </Button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <AiOverviewFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        item={formItem}
        customerName={customerName}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`ลบ AI Overview “${deleteTarget?.title ?? ''}”?`}
        consequences={[
          'ลูกค้าจะไม่เห็นรายการนี้ในรายงานอีก',
          ...(deleteTarget && deleteTarget.images.length > 0
            ? [`รูปภาพ ${deleteTarget.images.length} รูปของรายการนี้จะถูกลบไปด้วย`]
            : []),
          'ลบแล้วกู้คืนไม่ได้',
        ]}
        onConfirm={confirmDelete}
      />
    </>
  )
}
