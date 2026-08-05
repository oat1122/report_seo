'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Info, Pencil } from 'lucide-react'
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
import { getClientStageLabel } from '../../../domain/policies/article-status'
import type { BlogStageCode } from '../../../domain/BlogArticle'

interface FeedbackDialogProps {
  /** stage ที่ลูกค้ากำลังขอแก้ — null = ปิด (การอนุมัติทำจากปุ่มใน thread ไม่ผ่าน dialog) */
  stageCode: BlogStageCode | null
  articleTitle: string
  isPending?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (comment: string) => void
}

export function FeedbackDialog({
  stageCode,
  articleTitle,
  isPending,
  onOpenChange,
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
          <DialogTitle className="flex items-center gap-2.5">
            <span className="bg-warning/12 text-warning flex size-9 shrink-0 items-center justify-center rounded-xl">
              <Pencil className="size-4.5" />
            </span>
            บอกทีมว่าอยากให้แก้ตรงไหน
          </DialogTitle>
          <DialogDescription>
            เรื่อง “{articleTitle}” · ขั้นตอน “{stageCode ? getClientStageLabel(stageCode) : ''}”
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="feedback-comment">อยากให้แก้อะไรบ้าง</Label>
          <Textarea
            id="feedback-comment"
            rows={4}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="เช่น หัวข้อที่ 1 ยาวไป ช่วยตัดให้สั้นลง / อยากได้หัวข้อที่พูดถึงราคาด้วย"
          />
          <span className="text-muted-foreground text-xs">
            พิมพ์ภาษาบ้าน ๆ ได้เลย ไม่ต้องใช้ศัพท์เทคนิค ทีมอ่านเข้าใจแน่นอน
          </span>
        </div>

        <div className="bg-muted border-border text-muted-foreground flex gap-2.5 rounded-xl border p-3 text-sm">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>
            กดส่งแล้วงานจะกลับไปที่ทีมเขียน ทีมจะแก้แล้วส่งกลับมาให้คุณดูใหม่ ไม่ได้ยกเลิกบทความนี้
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยังไม่ส่ง
          </Button>
          <Button
            className="bg-warning text-warning-foreground hover:bg-warning/90"
            disabled={isPending || comment.trim().length === 0}
            onClick={() => onSubmit(comment)}
          >
            ส่งให้ทีมแก้
            <ArrowRight className="ml-1.5 size-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
