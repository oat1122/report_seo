'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmDeleteDialogProps {
  open: boolean
  title: string
  /** ผลที่จะเกิดหลังกดลบ — แสดงเป็นข้อ ๆ ให้เห็นก่อนตัดสินใจ */
  consequences: string[]
  confirmLabel: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/** ยืนยันการลบของแผนบทความ — ใช้ทั้งลบบทความและลบไฟล์ */
export function ConfirmDeleteDialog({
  open,
  title,
  consequences,
  confirmLabel,
  onOpenChange,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <ul className="text-text-secondary flex list-disc flex-col gap-1 pl-5 text-left text-sm">
              {consequences.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
