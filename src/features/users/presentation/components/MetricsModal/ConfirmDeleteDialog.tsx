'use client'

import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { MOBILE_SHEET_CLASS } from './domainFormat'

interface ConfirmDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** ผลที่จะเกิดขึ้นหลังลบ — แสดงเป็นรายการ (rule 10) */
  consequences: string[]
  onConfirm: () => void
}

/** ยืนยันการลบ (Keyword / Keyword แนะนำ / AI Overview) */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  consequences,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn(MOBILE_SHEET_CLASS)}>
        <AlertDialogHeader>
          <AlertDialogMedia variant="destructive">
            <Trash2 aria-hidden />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <ul className="flex list-disc flex-col gap-1 pl-5">
              {consequences.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            ลบ
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
