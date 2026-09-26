'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toDateInputValue } from '@/lib/date'
import { BlogPlanPageShell } from './BlogPlanPageShell'
import { KeywordPicker } from './KeywordPicker'
import { useBlogKeywords } from '../../hooks/useBlogPlan'
import { useUnsavedGuard } from '../../hooks/useUnsavedGuard'
import type { ArticleKeywordInput } from '../../../schemas'
import type { BlogArticle } from '../../../domain/BlogArticle'

export interface ArticleFormValues {
  title: string
  keyFocus: string
  startDate: string
  note: string
  keywords: ArticleKeywordInput[]
}

interface ArticleFormViewProps {
  customerId: string
  /** ไม่ส่ง = โหมดสร้างใหม่ */
  article?: BlogArticle
  isPending?: boolean
  onCancel: () => void
  onSubmit: (values: ArticleFormValues) => void
}

const EMPTY: ArticleFormValues = { title: '', keyFocus: '', startDate: '', note: '', keywords: [] }

function initialValues(article?: BlogArticle): ArticleFormValues {
  if (!article) return EMPTY
  return {
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
}

export function ArticleFormView({
  customerId,
  article,
  isPending,
  onCancel,
  onSubmit,
}: ArticleFormViewProps) {
  const [values, setValues] = useState<ArticleFormValues>(() => initialValues(article))
  const { data: keywordOptions, isLoading } = useBlogKeywords(customerId)

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues(article))
  const confirmLeave = useUnsavedGuard(isDirty)

  const patch = (next: Partial<ArticleFormValues>) => setValues((prev) => ({ ...prev, ...next }))
  const leave = () => {
    if (confirmLeave()) onCancel()
  }

  return (
    <BlogPlanPageShell
      title={article ? 'แก้ไขบทความ' : 'เพิ่มบทความ'}
      description="กำหนดหัวข้อและวันเริ่ม — ระบบจะไล่กำหนดส่งทุกขั้นตอนให้อัตโนมัติ"
      onBack={leave}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="article-title" className="text-[13px] font-medium">
          หัวข้อ / Main Idea
          <span aria-hidden className="text-destructive">
            *
          </span>
        </Label>
        <Input
          id="article-title"
          aria-required
          className="h-11 rounded-[12px]"
          value={values.title}
          onChange={(event) => patch({ title: event.target.value })}
          placeholder="เช่น 5 วิธีเลือกเครื่องกรองน้ำสำหรับโรงงาน"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="article-key-focus" className="text-[13px] font-medium">
          Key Focus
        </Label>
        <Textarea
          id="article-key-focus"
          rows={2}
          className="min-h-0 resize-y rounded-[12px]"
          value={values.keyFocus}
          onChange={(event) => patch({ keyFocus: event.target.value })}
          placeholder="ธีมหลักของเดือน"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="article-start-date" className="text-[13px] font-medium">
            วันเริ่มงาน
          </Label>
          <Input
            id="article-start-date"
            type="date"
            className="h-11 rounded-[12px]"
            value={values.startDate}
            onChange={(event) => patch({ startDate: event.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="article-keyword-search" className="text-[13px] font-medium">
          Keyword ที่จะใช้
        </Label>
        <KeywordPicker
          inputId="article-keyword-search"
          options={keywordOptions ?? []}
          isLoading={isLoading}
          selected={values.keywords}
          onChange={(keywords) => patch({ keywords })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="article-note" className="text-[13px] font-medium">
          โน้ต
        </Label>
        <Textarea
          id="article-note"
          rows={4}
          className="resize-y rounded-[12px]"
          value={values.note}
          onChange={(event) => patch({ note: event.target.value })}
          placeholder="ข้อความถึงผู้เขียน เช่น โทนภาษา ลิงก์อ้างอิง"
        />
      </div>

      <div className="border-border flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center">
        <span className="text-text-secondary text-xs sm:mr-auto">
          <span aria-hidden className="text-destructive">
            *
          </span>{' '}
          จำเป็นต้องกรอก
        </span>
        <Button variant="outline" className="h-11 rounded-[12px] px-4" onClick={leave}>
          ยกเลิก
        </Button>
        <Button
          className="h-11 rounded-[12px] px-4"
          disabled={isPending || values.title.trim().length === 0}
          onClick={() => onSubmit(values)}
        >
          {!article && <Plus className="size-4" />}
          {article ? 'บันทึก' : 'เพิ่มบทความ'}
        </Button>
      </div>
    </BlogPlanPageShell>
  )
}
