'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Reveal } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArticleThread } from './ArticleThread'
import { FilePreviewDialog } from './FilePreviewDialog'
import type { BlogArticle, BlogArticleFile } from '../../../domain/BlogArticle'

interface BlogPlanPageShellProps {
  title: ReactNode
  description: ReactNode
  /** ส่งบทความมา = กางคอลัมน์ "ที่มาของเรื่อง" ด้านขวาให้อ่านรอบก่อนหน้าไปด้วยระหว่างเขียน */
  contextArticle?: BlogArticle
  canManage?: boolean
  canRespond?: boolean
  /** true = ไม่จำกัดความกว้าง — ฟอร์มอ่านง่ายเมื่อบรรทัดสั้น แต่ตารางต้องการเต็มจอ */
  wide?: boolean
  onBack: () => void
  children: ReactNode
}

export function BlogPlanPageShell({
  title,
  description,
  contextArticle,
  canManage = false,
  canRespond = false,
  wide = false,
  onBack,
  children,
}: BlogPlanPageShellProps) {
  const [previewFile, setPreviewFile] = useState<BlogArticleFile | null>(null)
  const threadRef = useRef<HTMLDivElement>(null)

  /** thread เรียงเก่า→ใหม่ เปิดมาจึงดีดลงล่างสุดให้เห็นรอบล่าสุดก่อน (ครั้งเดียวตอนเปิด/เปลี่ยนบทความ) */
  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [contextArticle?.id])

  // หน้าฟอร์ม = การ์ดแก้วใบเดียว, หน้าตาราง (wide) = ให้ลูกจัดการ์ดเอง
  const body = wide ? (
    <div className="flex flex-col gap-4">{children}</div>
  ) : (
    <Card className="gap-5 px-5 py-5 sm:px-6 sm:py-6">{children}</Card>
  )

  return (
    <Reveal className="flex flex-col gap-5">
      <Button variant="ghost" className="h-11 w-fit rounded-[12px] px-3 sm:h-9" onClick={onBack}>
        <ArrowLeft className="size-4" />
        กลับแผนบทความ
      </Button>

      <header className="flex flex-col gap-1">
        <h2 className="text-xl leading-snug font-semibold sm:text-[22px]">{title}</h2>
        <p className="text-text-secondary text-[13px] leading-relaxed">{description}</p>
      </header>

      {contextArticle ? (
        <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {body}

          <Card
            ref={threadRef}
            role="region"
            aria-label="ที่มาของเรื่อง"
            className="max-h-[70vh] gap-3 overflow-y-auto px-5 py-5"
          >
            <div className="flex flex-col gap-0.5">
              <strong className="text-[15px] font-semibold">ที่มาของเรื่อง</strong>
              <span className="text-text-secondary text-xs">
                รอบก่อนหน้าและสิ่งที่อีกฝ่ายบอกไว้ — อ่านทวนได้ระหว่างเขียน
              </span>
            </div>
            {/* อ่านอย่างเดียว — ไม่ส่ง onUnsubmit ปุ่มลงมือทั้งหมดจึงไม่ขึ้น */}
            <ArticleThread
              article={contextArticle}
              canManage={canManage}
              canRespond={canRespond}
              onPreviewFile={setPreviewFile}
            />
          </Card>
        </div>
      ) : (
        <div className={cn(!wide && 'w-full max-w-3xl')}>{body}</div>
      )}

      <FilePreviewDialog
        file={previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
      />
    </Reveal>
  )
}
