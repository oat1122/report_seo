'use client'

import Link from 'next/link'
import { ArrowRight, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { initialsOf } from '@/components/Layout/AppSidebar'
import { ExportReportMenu } from './ExportReportMenu'

interface CustomerHubHeroProps {
  userId: string
  userName: string
  domain: string | null | undefined
}

/** หัวหน้า hub: avatar + คำทักทาย + ชื่อ + โดเมน | ส่งออกรายงาน + ไปหน้ารายงาน */
export function CustomerHubHero({ userId, userName, domain }: CustomerHubHeroProps) {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-3.5">
        {userName && (
          <span
            aria-hidden
            className="bg-info-subtle border-background shadow-card hidden size-[50px] shrink-0 items-center justify-center rounded-full border-2 text-[17px] font-semibold sm:flex"
          >
            {initialsOf(userName)}
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-1.5 sm:gap-0.5">
          <span className="text-text-secondary text-[13px]">ยินดีต้อนรับกลับมา</span>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3.5">
            <h1 className="text-[26px] leading-tight font-semibold break-words md:text-[28px]">
              {userName || 'ลูกค้า'}
            </h1>
            {domain && (
              <span className="border-glass-border text-text-secondary inline-flex h-8 w-fit max-w-full min-w-0 items-center gap-1.5 rounded-full border bg-white/70 px-3 text-[13px] dark:bg-white/5">
                <Globe aria-hidden className="size-3.5 shrink-0" />
                <span className="truncate">{domain}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap sm:items-center">
        <ExportReportMenu customerId={userId} className="w-full sm:w-auto" />
        <Button
          asChild
          variant="outline"
          className="h-[46px] w-full rounded-[14px] px-[18px] sm:w-auto"
        >
          <Link href="/customer/report">
            ดูรายงาน SEO ฉบับเต็ม
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  )
}
