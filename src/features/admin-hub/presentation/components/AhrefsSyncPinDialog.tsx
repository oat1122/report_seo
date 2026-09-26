'use client'

import { useEffect, useState } from 'react'
import { KeyRound, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { cn } from '@/lib/utils'

const PIN_LENGTH = 6

interface AhrefsSyncPinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // resolve เมื่อ PIN ถูก (dialog จะถูกปิดโดย parent), reject เมื่อ PIN ผิด (เคลียร์ช่องให้กรอกใหม่)
  onConfirm: (pin: string) => Promise<unknown>
  isPending: boolean
  /** จำนวนลูกค้าที่จะถูกซิงก์ — แสดงในคำอธิบายถ้ามี */
  customerCount?: number
}

export function AhrefsSyncPinDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  customerCount,
}: AhrefsSyncPinDialogProps) {
  const [pin, setPin] = useState('')

  // เคลียร์ PIN ทุกครั้งที่ dialog ปิด (ทั้งกรณีสำเร็จที่ parent สั่งปิด และผู้ใช้กดยกเลิก)
  useEffect(() => {
    if (!open) setPin('')
  }, [open])

  const handleOpenChange = (next: boolean) => {
    if (isPending) return // ห้ามปิดระหว่างกำลังซิงก์
    onOpenChange(next)
  }

  const submit = (value: string) => {
    if (value.length < PIN_LENGTH || isPending) return
    onConfirm(value).catch(() => setPin('')) // error ถูก toast จาก axios interceptor แล้ว
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col gap-[18px] p-[26px] sm:max-w-[420px]"
      >
        <span
          aria-hidden
          className="bg-foreground text-secondary flex size-[52px] items-center justify-center rounded-[16px] dark:bg-white/10"
        >
          <KeyRound className="size-6" />
        </span>

        <div className="flex flex-col gap-1.5">
          <DialogTitle className="text-xl leading-snug font-semibold">
            ใส่ PIN เพื่อยืนยัน
          </DialogTitle>
          <DialogDescription className="text-text-secondary text-sm leading-relaxed">
            ระบบจะดึงข้อมูลล่าสุดจาก Ahrefs ให้ลูกค้าทุกราย
            {customerCount != null && ` (${customerCount.toLocaleString('th-TH')} ราย)`} กรอก PIN{' '}
            {PIN_LENGTH} หลักเพื่อเริ่มซิงก์
          </DialogDescription>
        </div>

        <InputOTP
          maxLength={PIN_LENGTH}
          value={pin}
          onChange={setPin}
          onComplete={submit}
          disabled={isPending}
          aria-label={`PIN ${PIN_LENGTH} หลัก`}
          autoFocus
        >
          <InputOTPGroup className="gap-2">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className={cn(
                  'h-14 w-11 rounded-[12px] border bg-white text-[22px] font-semibold first:rounded-[12px] last:rounded-[12px] sm:w-12 dark:bg-white/5',
                  i < pin.length && 'border-info-strong border-2',
                )}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            ยกเลิก
          </Button>
          <Button onClick={() => submit(pin)} disabled={isPending || pin.length < PIN_LENGTH}>
            {isPending && <Loader2 aria-hidden className="animate-spin" />}
            {isPending ? 'กำลังซิงก์...' : 'ยืนยัน'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
