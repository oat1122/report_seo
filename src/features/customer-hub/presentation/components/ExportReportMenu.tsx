'use client'

import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { ReportExportFormat } from '@/features/customer-report'
import { useDownloadReport } from '../hooks/useDownloadReport'

interface ExportReportMenuProps {
  customerId: string
  className?: string
}

/** ปุ่มดำ "ส่งออกรายงาน" → เลือก PDF / Excel (ใช้ทั้ง hub และหน้ารายงาน) */
export function ExportReportMenu({ customerId, className }: ExportReportMenuProps) {
  const downloadReport = useDownloadReport(customerId)
  const isPending = downloadReport.isPending

  const run = (format: ReportExportFormat) =>
    downloadReport.mutate(format, {
      onError: () =>
        toast.error('ส่งออกรายงานไม่สำเร็จ ลองใหม่อีกครั้ง หากยังไม่ได้ให้ติดต่อทีมงาน'),
    })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={isPending}
          className={cn('h-[46px] gap-2 rounded-[14px] px-[18px] text-sm', className)}
        >
          {isPending ? (
            <Loader2 aria-hidden className="size-4 animate-spin" />
          ) : (
            <Download aria-hidden className="size-4" />
          )}
          {isPending ? 'กำลังเตรียมไฟล์…' : 'ส่งออกรายงาน'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => run('pdf')}>
          <FileText className="size-4" />
          PDF (.pdf)
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => run('xlsx')}>
          <FileSpreadsheet className="size-4" />
          Excel (.xlsx)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
