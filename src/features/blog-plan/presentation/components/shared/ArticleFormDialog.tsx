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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toDateInputValue } from '@/lib/date'
import { KeywordPicker } from './KeywordPicker'
import { useBlogKeywords } from '../../hooks/useBlogPlan'
import type { ArticleKeywordInput } from '../../../schemas'
import type { BlogArticle } from '../../../domain/BlogArticle'

export interface ArticleFormValues {
  title: string
  keyFocus: string
  startDate: string
  note: string
  keywords: ArticleKeywordInput[]
}

interface ArticleFormDialogProps {
  customerId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  /** ไม่ส่ง = โหมดสร้างใหม่ */
  article?: BlogArticle
  isPending?: boolean
  onSubmit: (values: ArticleFormValues) => void
}

const EMPTY: ArticleFormValues = { title: '', keyFocus: '', startDate: '', note: '', keywords: [] }

export function ArticleFormDialog({
  customerId,
  open,
  onOpenChange,
  article,
  isPending,
  onSubmit,
}: ArticleFormDialogProps) {
  const [values, setValues] = useState<ArticleFormValues>(EMPTY)
  const { data: keywordOptions, isLoading } = useBlogKeywords(customerId)

  useEffect(() => {
    if (!open) return
    setValues(
      article
        ? {
            title: article.title,
            keyFocus: article.keyFocus ?? '',
            startDate: toDateInputValue(article.startDate),
            note: article.note ?? '',
            keywords: article.keywords.map((k) => ({
              keyword: k.keyword,
              source: k.source,
              sourceId: k.sourceId,
            })),
          }
        : EMPTY,
    )
  }, [open, article])

  const patch = (next: Partial<ArticleFormValues>) => setValues((prev) => ({ ...prev, ...next }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{article ? 'แก้ไขบทความ' : 'เพิ่มบทความ'}</DialogTitle>
          <DialogDescription>
            กำหนดหัวข้อและวันเริ่ม — ระบบจะไล่กำหนดส่งทุกขั้นตอนให้อัตโนมัติ
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="article-title">หัวข้อ / Main Idea</Label>
            <Input
              id="article-title"
              value={values.title}
              onChange={(event) => patch({ title: event.target.value })}
              placeholder="เช่น 5 วิธีเลือกเครื่องกรองน้ำสำหรับโรงงาน"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="article-key-focus">Key Focus</Label>
              <Input
                id="article-key-focus"
                value={values.keyFocus}
                onChange={(event) => patch({ keyFocus: event.target.value })}
                placeholder="ธีมหลักของเดือน"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="article-start-date">วันเริ่มงาน</Label>
              <Input
                id="article-start-date"
                type="date"
                value={values.startDate}
                onChange={(event) => patch({ startDate: event.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Keyword ที่จะใช้</Label>
            <KeywordPicker
              options={keywordOptions ?? []}
              isLoading={isLoading}
              selected={values.keywords}
              onChange={(keywords) => patch({ keywords })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="article-note">โน้ต</Label>
            <Textarea
              id="article-note"
              rows={3}
              value={values.note}
              onChange={(event) => patch({ note: event.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            disabled={isPending || values.title.trim().length === 0}
            onClick={() => onSubmit(values)}
          >
            {article ? 'บันทึก' : 'เพิ่มบทความ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
