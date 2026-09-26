'use client'

import { Loader2, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  // ปุ่มยืนยัน "อัปเดต + ดำเนินการต่อ" (สร้าง/บันทึกเอกสาร)
  onUpdateAndProceed: () => void
  // ปุ่ม "ดำเนินการต่อโดยไม่อัปเดต DB"
  onProceedWithoutSync: () => void
  isPending: boolean
  // ข้อความปุ่มดำเนินการ เช่น "สร้าง" / "บันทึก"
  proceedLabel: string
}

export function CustomerSyncDialog({
  open,
  onOpenChange,
  onUpdateAndProceed,
  onProceedWithoutSync,
  isPending,
  proceedLabel,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="data-[size=default]:max-w-[min(520px,calc(100%-2rem))]">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <UserCog aria-hidden />
          </AlertDialogMedia>
          <AlertDialogTitle>อัปเดตข้อมูลลูกค้าในระบบ?</AlertDialogTitle>
          <AlertDialogDescription>
            ข้อมูลลูกค้าที่กรอกในเอกสารต่างจากที่บันทึกไว้ในระบบ
            ต้องการอัปเดตข้อมูลลูกค้าในระบบให้ตรงกับเอกสารนี้ไหม?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* 3 ปุ่ม: มือถือเรียงแนวตั้ง (ปุ่มหลักบนสุด) · จอกว้างเรียงแถวเดียว ยกเลิกซ้าย ปุ่มหลักขวาสุด */}
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <AlertDialogCancel disabled={isPending}>ยกเลิก</AlertDialogCancel>
          <Button variant="outline" onClick={onProceedWithoutSync} disabled={isPending}>
            {proceedLabel}โดยไม่อัปเดต
          </Button>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onUpdateAndProceed()
            }}
            disabled={isPending}
          >
            {isPending && <Loader2 aria-hidden className="animate-spin" />}
            อัปเดตแล้ว{proceedLabel}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
