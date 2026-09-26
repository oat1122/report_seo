'use client'

import { FileText, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { displayFilename } from '@/lib/filename'
import { useListContractFiles } from '../../hooks/useContractFiles'
import { formatPaymentDate } from '../shared/payment-view'

interface MyContractFilesProps {
  customerId: string
}

export function MyContractFiles({ customerId }: MyContractFilesProps) {
  const { data: files, isLoading } = useListContractFiles(customerId)

  return (
    <Card role="region" aria-labelledby="my-contract-files-title" className="gap-3.5 px-5 py-5">
      <div className="flex flex-col gap-1">
        <h2 id="my-contract-files-title" className="text-[17px] font-semibold">
          ไฟล์สัญญา
        </h2>
        <p className="text-text-secondary text-[13px]">
          {isLoading
            ? 'กำลังโหลดไฟล์…'
            : files?.length
              ? `${files.length} ไฟล์ · เปิดอ่านหรือดาวน์โหลดเก็บไว้ได้ตลอด`
              : 'สัญญาที่ทีมอัปโหลดให้จะอยู่ที่นี่'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <Skeleton className="h-14 w-full rounded-[12px]" />
          <Skeleton className="h-14 w-full rounded-[12px]" />
        </div>
      ) : !files?.length ? (
        <p className="text-text-secondary border-border rounded-[14px] border border-dashed px-4 py-5 text-center text-sm">
          ยังไม่มีไฟล์สัญญา
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {files.map((file) => {
            const name = displayFilename(file.fileName)
            return (
              <li
                key={file.id}
                className="flex items-center gap-3 rounded-[12px] bg-white/70 px-3 py-2.5 dark:bg-white/5"
              >
                <span
                  aria-hidden
                  className="bg-info-subtle text-info-strong flex size-9 shrink-0 items-center justify-center rounded-[10px]"
                >
                  <FileText className="size-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">{name}</span>
                  <span className="text-text-secondary text-xs">
                    อัปโหลดเมื่อ {formatPaymentDate(file.uploadDate)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="h-11 shrink-0 rounded-[10px] px-3 text-[13px] sm:h-9"
                  asChild
                >
                  <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Eye className="size-3.5" />
                    เปิดไฟล์
                  </a>
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
