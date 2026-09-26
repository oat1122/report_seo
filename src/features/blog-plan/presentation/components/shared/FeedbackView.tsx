'use client'

import { useState } from 'react'
import { ArrowRight, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BlogPlanPageShell } from './BlogPlanPageShell'
import { useUnsavedGuard } from '../../hooks/useUnsavedGuard'
import { getClientStageLabel } from '../../../domain/policies/article-status'
import { BLOG_MESSAGE_MAX_LENGTH } from '../../../schemas'
import type { BlogArticle, BlogStageCode } from '../../../domain/BlogArticle'

interface FeedbackViewProps {
  article: BlogArticle
  /** stage ที่ลูกค้ากำลังขอแก้ (การอนุมัติกดจากปุ่มใน thread ไม่ผ่านหน้านี้) */
  stageCode: BlogStageCode
  isPending?: boolean
  onCancel: () => void
  onSubmit: (comment: string) => void
}

export function FeedbackView({
  article,
  stageCode,
  isPending,
  onCancel,
  onSubmit,
}: FeedbackViewProps) {
  const [comment, setComment] = useState('')
  const confirmLeave = useUnsavedGuard(comment.trim().length > 0)

  const leave = () => {
    if (confirmLeave()) onCancel()
  }

  return (
    <BlogPlanPageShell
      title="บอกทีมว่าอยากให้แก้ตรงไหน"
      description={`เรื่อง “${article.title}” · ขั้นตอน “${getClientStageLabel(stageCode)}”`}
      contextArticle={article}
      canRespond
      onBack={leave}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feedback-comment" className="text-[13px] font-medium">
          อยากให้แก้อะไรบ้าง
        </Label>
        <Textarea
          id="feedback-comment"
          rows={18}
          className="min-h-80 resize-y rounded-[12px] leading-relaxed"
          maxLength={BLOG_MESSAGE_MAX_LENGTH}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="เช่น หัวข้อที่ 1 ยาวไป ช่วยตัดให้สั้นลง / อยากได้หัวข้อที่พูดถึงราคาด้วย"
        />
        <div className="text-text-secondary flex flex-wrap justify-between gap-2 text-xs">
          <span>พิมพ์ภาษาบ้าน ๆ ได้เลย ไม่ต้องใช้ศัพท์เทคนิค ทีมอ่านเข้าใจแน่นอน</span>
          <span className="tabular-nums">
            {comment.length.toLocaleString('th-TH')} /{' '}
            {BLOG_MESSAGE_MAX_LENGTH.toLocaleString('th-TH')}
          </span>
        </div>
      </div>

      <div className="bg-info-subtle text-foreground flex gap-2.5 rounded-[14px] p-3.5 text-[13px] leading-relaxed">
        <Info aria-hidden className="text-info-strong mt-0.5 size-4 shrink-0" />
        <p>
          กดส่งแล้วงานจะกลับไปที่ทีมเขียน ทีมจะแก้แล้วส่งกลับมาให้คุณดูใหม่ ไม่ได้ยกเลิกบทความนี้
        </p>
      </div>

      <div className="border-border grid grid-cols-2 gap-2 border-t pt-4 sm:flex sm:justify-end">
        <Button variant="outline" className="h-11 rounded-[12px] px-4" onClick={leave}>
          ยังไม่ส่ง
        </Button>
        <Button
          className="h-11 rounded-[12px] px-4"
          disabled={isPending || comment.trim().length === 0}
          onClick={() => onSubmit(comment)}
        >
          ส่งให้ทีมแก้
          <ArrowRight aria-hidden className="size-4" />
        </Button>
      </div>
    </BlogPlanPageShell>
  )
}
