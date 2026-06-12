'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

const PIN_LENGTH = 6

interface AhrefsSyncPinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // resolve เมื่อ PIN ถูก (dialog จะถูกปิดโดย parent), reject เมื่อ PIN ผิด (เคลียร์ช่องให้กรอกใหม่)
  onConfirm: (pin: string) => Promise<unknown>
  isPending: boolean
}

export function AhrefsSyncPinDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>ใส่ PIN เพื่อยืนยัน</DialogTitle>
          <DialogDescription>
            ระบบจะดึงข้อมูลล่าสุดจาก Ahrefs ให้ลูกค้าทุกราย กรอก PIN เพื่อเริ่มซิงก์
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-2">
          <InputOTP
            maxLength={PIN_LENGTH}
            value={pin}
            onChange={setPin}
            onComplete={submit}
            disabled={isPending}
            autoFocus
          >
            <InputOTPGroup>
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            ยกเลิก
          </Button>
          <Button onClick={() => submit(pin)} disabled={isPending || pin.length < PIN_LENGTH}>
            {isPending && <Loader2 className="mr-1 size-4 animate-spin" />}
            ยืนยัน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
