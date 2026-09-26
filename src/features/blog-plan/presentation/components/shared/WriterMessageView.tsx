'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BlogPlanPageShell } from './BlogPlanPageShell'
import { useUnsavedGuard } from '../../hooks/useUnsavedGuard'

interface WriterMessageViewProps {
  writerName: string | null
  isPending?: boolean
  onCancel: () => void
  onSubmit: (message: string) => void
}

export function WriterMessageView({
  writerName,
  isPending,
  onCancel,
  onSubmit,
}: WriterMessageViewProps) {
  const [message, setMessage] = useState('')
  const confirmLeave = useUnsavedGuard(message.trim().length > 0)

  const leave = () => {
    if (confirmLeave()) onCancel()
  }

  return (
    <BlogPlanPageShell
      title="ทักทีมเขียน"
      description={`ข้อความจะไปเด้งที่กระดิ่งแจ้งเตือนของ${writerName ? ` ${writerName}` : 'ทีมเขียน'} ทันที`}
      onBack={leave}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="writer-message" className="text-[13px] font-medium">
          อยากบอกอะไรทีมเขียน
        </Label>
        <Textarea
          id="writer-message"
          rows={14}
          className="min-h-64 resize-y rounded-[12px] leading-relaxed"
          maxLength={1000}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="เช่น เดือนนี้อยากได้บทความเกี่ยวกับโปรโมชันสงกรานต์ด้วยครับ"
        />
        <span className="text-text-secondary text-xs">
          ข้อความนี้เป็นการแจ้งเตือนทางเดียว ทีมจะตอบกลับผ่านการส่งงานในแต่ละบทความ
        </span>
      </div>

      <div className="border-border grid grid-cols-2 gap-2 border-t pt-4 sm:flex sm:justify-end">
        <Button variant="outline" className="h-11 rounded-[12px] px-4" onClick={leave}>
          ยกเลิก
        </Button>
        <Button
          className="h-11 rounded-[12px] px-4"
          disabled={isPending || message.trim().length === 0}
          onClick={() => onSubmit(message.trim())}
        >
          <Send aria-hidden className="size-4" />
          ส่งข้อความ
        </Button>
      </div>
    </BlogPlanPageShell>
  )
}
