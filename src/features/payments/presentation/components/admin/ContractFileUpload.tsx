'use client'

import { useRef, useState } from 'react'
import { Upload, FileText, Trash2, Loader2, Eye } from 'lucide-react'
import { AnimatePresence, motion } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { displayFilename } from '@/lib/filename'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  useListContractFiles,
  useUploadContractFile,
  useDeleteContractFile,
} from '../../hooks/useContractFiles'
import { formatPaymentDate } from '../shared/payment-view'

interface ContractFileUploadProps {
  customerId: string
}

export function ContractFileUpload({ customerId }: ContractFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const { data: files, isLoading } = useListContractFiles(customerId)
  const uploadMutation = useUploadContractFile()
  const deleteMutation = useDeleteContractFile()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadMutation.mutate({ customerId, file })
    e.target.value = ''
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate({ customerId, contractId: deleteTarget.id })
    setDeleteTarget(null)
  }

  return (
    <Card role="region" aria-labelledby="contract-files-title" className="gap-3.5 px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id="contract-files-title" className="text-[17px] font-semibold">
            ไฟล์สัญญา
          </h2>
          <p className="text-text-secondary text-[13px]">
            {isLoading
              ? 'กำลังโหลดไฟล์…'
              : files?.length
                ? `${files.length} ไฟล์ · ลูกค้าเปิดดูได้จากหน้าการชำระเงินของตัวเอง`
                : 'PDF หรือ Word — ลูกค้าจะเห็นไฟล์ที่อัปโหลดทันที'}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          aria-label="เลือกไฟล์สัญญา"
          onChange={handleFileSelect}
        />
        <Button
          variant="outline"
          className="h-11 shrink-0 rounded-[12px] px-3.5 text-[13px] sm:h-9"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {uploadMutation.isPending ? 'กำลังอัปโหลด…' : 'อัปโหลด'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          <Skeleton className="h-14 w-full rounded-[12px]" />
          <Skeleton className="h-14 w-full rounded-[12px]" />
        </div>
      ) : files?.length === 0 ? (
        <p className="text-text-secondary border-border rounded-[14px] border border-dashed px-4 py-5 text-center text-sm">
          ยังไม่มีไฟล์สัญญา
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {files?.map((file) => {
              const name = displayFilename(file.fileName)
              return (
                <motion.li
                  key={file.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
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
                    variant="ghost"
                    className="size-11 shrink-0 rounded-[10px] p-0 sm:size-9"
                    asChild
                  >
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`เปิด ${name}`}
                      title="เปิดไฟล์"
                    >
                      <Eye className="size-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-danger-strong hover:bg-danger-subtle hover:text-danger-strong size-11 shrink-0 rounded-[10px] p-0 sm:size-9"
                    aria-label={`ลบ ${name}`}
                    title="ลบไฟล์"
                    onClick={() => setDeleteTarget({ id: file.id, name })}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบไฟล์ “{deleteTarget?.name}” ?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <ul className="text-text-secondary flex list-disc flex-col gap-1 pl-5 text-left text-sm">
                <li>ไฟล์จะถูกลบออกจากระบบ</li>
                <li>ลูกค้าจะเปิดหรือดาวน์โหลดสัญญาฉบับนี้ไม่ได้อีก</li>
                <li>ลบแล้วกู้คืนไม่ได้ ต้องอัปโหลดใหม่เท่านั้น</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmDelete}>
              ลบไฟล์
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
