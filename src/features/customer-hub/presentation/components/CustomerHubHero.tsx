'use client'

import Link from 'next/link'
import { ArrowRight, Download, FileSpreadsheet, FileText, Globe, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDownloadReport } from '../hooks/useDownloadReport'

interface CustomerHubHeroProps {
  userId: string
  userName: string
  domain: string | null | undefined
}

export function CustomerHubHero({ userId, userName, domain }: CustomerHubHeroProps) {
  const downloadReport = useDownloadReport(userId)

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 py-1">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight md:text-[25px]">
          {userName ? `ยินดีต้อนรับกลับมา, ${userName} 👋` : 'ยินดีต้อนรับกลับมา 👋'}
        </h1>
        {domain && (
          <span className="flex items-center gap-1.5 text-sm">
            <Globe className="text-info size-4" />
            <span className="text-foreground/70 font-medium">{domain}</span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              disabled={downloadReport.isPending}
            >
              {downloadReport.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              ดาวน์โหลดรายงาน
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => downloadReport.mutate('pdf')}>
              <FileText className="size-4" />
              PDF (.pdf)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => downloadReport.mutate('xlsx')}>
              <FileSpreadsheet className="size-4" />
              Excel (.xlsx)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="lg" className="gap-2" asChild>
          <Link href="/customer/report">
            ดูรายงาน SEO ฉบับเต็ม
            <ArrowRight className="text-secondary size-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
