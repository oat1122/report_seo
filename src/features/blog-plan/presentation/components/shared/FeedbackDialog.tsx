'use client'

import { useEffect, useState } from 'react'
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
import { getStageLabel } from '../../../domain/policies/article-status'
import type { BlogFeedbackDecision, BlogStageCode } from '../../../domain/BlogArticle'

interface FeedbackDialogProps {
  stageCode: BlogStageCode | null
  onOpenChange: (open: boolean) => void
  isPending?: boolean
  onSubmit: (decision: BlogFeedbackDecision, comment: string) => void
}

export function FeedbackDialog({
  stageCode,
  onOpenChange,
  isPending,
  onSubmit,
}: FeedbackDialogProps) {
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (stageCode) setComment('')
  }, [stageCode])

  return (
    <Dialog open={Boolean(stageCode)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>ให้ความเห็น</DialogTitle>
          <DialogDescription>
            {stageCode ? getStageLabel(stageCode) : ''} — กดอนุมัติเพื่อไปขั้นตอนถัดไป
            หรือขอแก้ไขเพื่อส่งกลับให้ทีมเขียน
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="feedback-comment">ข้อเสนอแนะ</Label>
          <Textarea
            id="feedback-comment"
            rows={4}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="ระบุสิ่งที่อยากให้ปรับ หรือเว้นว่างถ้าอนุมัติเลย"
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            variant="outline"
            className="border-destructive/30 text-destructive"
            disabled={isPending || comment.trim().length === 0}
            onClick={() => onSubmit('CHANGES_REQUESTED', comment)}
          >
            ขอแก้ไข
          </Button>
          <Button disabled={isPending} onClick={() => onSubmit('APPROVED', comment)}>
            อนุมัติ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
