'use client'

import { useState } from 'react'
import { FilePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { AllDocumentsTable } from './AllDocumentsTable'
import { StandaloneDocumentCreator } from './StandaloneDocumentCreator'

export function AdminDocumentManager() {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="text-[26px] leading-tight font-semibold md:text-[28px]">จัดการเอกสาร</h1>
          <p className="text-text-secondary text-[13px] md:text-sm">
            ดูและจัดการเอกสาร PDF ของลูกค้าทุกราย
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="shrink-0">
          <FilePlus aria-hidden />
          สร้างเอกสารใหม่
        </Button>
      </header>

      <AllDocumentsTable />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          showCloseButton={false}
          size="xl"
          className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden p-0 max-sm:pb-0"
        >
          <header className="flex items-start gap-3.5 px-6 pt-[22px] pb-[18px]">
            <span
              aria-hidden
              className="bg-info-subtle text-info-strong flex size-11 shrink-0 items-center justify-center rounded-[14px]"
            >
              <FilePlus className="size-5" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <DialogTitle className="text-xl leading-snug font-semibold">
                สร้างเอกสารใหม่
              </DialogTitle>
              <DialogDescription className="text-text-secondary text-[13px]">
                สร้าง PDF โดยกรอกข้อมูลลูกค้าเอง หรือเลือกจากลูกค้าในระบบ
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="outline" size="icon-sm" aria-label="ปิด" className="shrink-0">
                <X aria-hidden />
              </Button>
            </DialogClose>
          </header>
          <StandaloneDocumentCreator
            onSuccess={() => setCreateOpen(false)}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
