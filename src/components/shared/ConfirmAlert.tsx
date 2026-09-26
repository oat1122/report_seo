import React from 'react'
import { CircleAlert, CircleCheck, Trash2, TriangleAlert } from 'lucide-react'
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

export interface ConfirmConsequence {
  text: string
  /** danger = ผลกระทบที่ต้องระวัง · safe = สิ่งที่ยังคงอยู่/ย้อนกลับได้ */
  tone: 'danger' | 'safe'
}

interface ConfirmAlertProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  /** รายการผลกระทบ (Handoff 04 ข้อ 10 — การลบต้องบอกผลที่ตามมา) */
  consequences?: ConfirmConsequence[]
  /** ข้อความปุ่มยืนยัน (ค่าเริ่มต้น "ยืนยัน") */
  confirmLabel?: string
  /** destructive = ปุ่มแดง + ไอคอนถังขยะ (ค่าเริ่มต้น) · default = ปุ่มหลักสีเข้ม */
  tone?: 'destructive' | 'default'
  /** แทนที่ไอคอนหัว dialog */
  icon?: React.ReactNode
}

export const ConfirmAlert: React.FC<ConfirmAlertProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  consequences,
  confirmLabel = 'ยืนยัน',
  tone = 'destructive',
  icon,
}) => {
  const isDestructive = tone === 'destructive'

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="data-[size=default]:max-w-[min(480px,calc(100%-2rem))]">
        <AlertDialogHeader>
          <AlertDialogMedia variant={isDestructive ? 'destructive' : 'default'}>
            {icon ?? (isDestructive ? <Trash2 aria-hidden /> : <TriangleAlert aria-hidden />)}
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>

        {consequences && consequences.length > 0 && (
          <ul className="bg-muted/60 flex flex-col gap-2 rounded-[14px] px-4 py-3.5 text-[13px] dark:bg-white/5">
            {consequences.map((c) => (
              <li key={c.text} className="flex items-start gap-2">
                {c.tone === 'danger' ? (
                  <CircleAlert aria-hidden className="text-danger-strong mt-0.5 size-4 shrink-0" />
                ) : (
                  <CircleCheck aria-hidden className="text-success mt-0.5 size-4 shrink-0" />
                )}
                <span>{c.text}</span>
              </li>
            ))}
          </ul>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction
            variant={isDestructive ? 'destructive' : 'default'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
