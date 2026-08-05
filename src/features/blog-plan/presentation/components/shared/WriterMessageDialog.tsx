'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface WriterMessageDialogProps {
  open: boolean
  writerName: string | null
  isPending?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (message: string) => void
}

export function WriterMessageDialog({
  open,
  writerName,
  isPending,
  onOpenChange,
  onSubmit,
}: WriterMessageDialogProps) {
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (open) setMessage('')
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <span className="bg-info/12 text-info flex size-9 shrink-0 items-center justify-center rounded-xl">
              <MessageSquare className="size-4.5" />
            </span>
            ทักทีมเขียน
          </DialogTitle>
          <DialogDescription>
            ข้อความจะไปเด้งที่กระดิ่งแจ้งเตือนของ{writerName ? ` ${writerName}` : 'ทีมเขียน'} ทันที
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="writer-message">อยากบอกอะไรทีมเขียน</Label>
          <Textarea
            id="writer-message"
            rows={4}
            maxLength={1000}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="เช่น เดือนนี้อยากได้บทความเกี่ยวกับโปรโมชันสงกรานต์ด้วยครับ"
          />
          <span className="text-muted-foreground text-xs">
            ข้อความนี้เป็นการแจ้งเตือนทางเดียว ทีมจะตอบกลับผ่านการส่งงานในแต่ละบทความ
          </span>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            disabled={isPending || message.trim().length === 0}
            onClick={() => onSubmit(message.trim())}
          >
            <Send className="mr-1.5 size-4" />
            ส่งข้อความ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
