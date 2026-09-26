'use client'

import { useState } from 'react'
import { Download, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useListBillingCycles, useDownloadCycleInvoice } from '../../hooks/useBillingCycles'
import { UploadProofDialog } from './UploadProofDialog'
import { StatusPill } from '../shared/StatusPill'
import {
  CYCLE_STATUS,
  formatAmount,
  formatMoney,
  formatPaymentDate,
  summarizeCycles,
} from '../shared/payment-view'
import type { BillingCycleWithPlan } from '../../../index'

interface MyBillingCyclesProps {
  customerId: string
}

export function MyBillingCycles({ customerId }: MyBillingCyclesProps) {
  const [uploadCycleId, setUploadCycleId] = useState<string | null>(null)
  const { data: cycles, isLoading, isError, refetch } = useListBillingCycles(customerId)
  const downloadInvoice = useDownloadCycleInvoice(customerId)

  const summary = summarizeCycles(cycles ?? [])
  const hasManyPlans = new Set(cycles?.map((cycle) => cycle.planId)).size > 1

  const actionProps = {
    downloadingCycleId: downloadInvoice.isPending ? downloadInvoice.variables?.cycleId : undefined,
    onUpload: setUploadCycleId,
    onDownload: (cycleId: string, includeVat: boolean) =>
      downloadInvoice.mutate({ cycleId, includeVat }),
  }

  return (
    <Card
      role="region"
      aria-labelledby="my-billing-cycles-title"
      className="min-w-0 gap-4 px-4 py-5 sm:px-5"
    >
      <div className="flex flex-col gap-1 px-1">
        <h2 id="my-billing-cycles-title" className="text-[17px] font-semibold">
          รอบจ่ายเงิน
        </h2>
        <p className="text-text-secondary text-[13px]">
          {isLoading
            ? 'กำลังโหลดรอบจ่ายเงิน…'
            : cycles?.length
              ? `${summary.totalCount} งวด · ชำระแล้ว ${summary.paidCount} งวด · อัปโหลดสลิปได้เมื่องวดนั้นมีใบแจ้งหนี้แล้ว`
              : 'รอบจ่ายเงินจะขึ้นที่นี่เมื่อทีมสร้างแผนชำระเงินให้'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-[14px]" />
          ))}
        </div>
      ) : isError ? (
        <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-8 text-center">
          <p className="text-sm font-medium">โหลดรอบจ่ายเงินไม่สำเร็จ</p>
          <p className="text-text-secondary text-[13px]">ตรวจการเชื่อมต่อแล้วลองโหลดใหม่อีกครั้ง</p>
          <Button variant="outline" className="h-11 rounded-[12px] px-4" onClick={() => refetch()}>
            โหลดใหม่
          </Button>
        </div>
      ) : !cycles?.length ? (
        <p className="text-text-secondary border-border rounded-2xl border border-dashed px-6 py-8 text-center text-sm">
          ยังไม่มีรอบจ่ายเงิน
        </p>
      ) : (
        <>
          <div className="hidden md:block">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-text-secondary box-border w-[56px] text-xs font-medium">
                    งวด
                  </TableHead>
                  <TableHead className="text-text-secondary box-border w-[132px] text-xs font-medium">
                    วันครบกำหนด
                  </TableHead>
                  <TableHead className="text-text-secondary box-border w-[120px] text-right text-xs font-medium">
                    จำนวนเงิน (บาท)
                  </TableHead>
                  <TableHead className="text-text-secondary box-border text-xs font-medium">
                    สถานะ
                  </TableHead>
                  <TableHead className="box-border w-[240px]">
                    <span className="sr-only">จัดการ</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycles.map((cycle) => (
                  <TableRow
                    key={cycle.id}
                    className={cn(
                      'h-14',
                      summary.next?.id === cycle.id && 'bg-info-subtle/70 hover:bg-info-subtle',
                    )}
                  >
                    <TableCell className="font-semibold tabular-nums">
                      {cycle.cycleNumber}
                    </TableCell>
                    <TableCell className="text-[13px]">
                      <span className="block">{formatPaymentDate(cycle.dueDate)}</span>
                      {hasManyPlans && (
                        <span className="text-text-secondary block truncate text-xs">
                          {cycle.plan.description}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatAmount(cycle.amount)}
                    </TableCell>
                    <TableCell>
                      <CycleStatus cycle={cycle} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <CycleActions cycle={cycle} {...actionProps} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="flex flex-col gap-2.5 md:hidden">
            {cycles.map((cycle) => (
              <li
                key={cycle.id}
                className={cn(
                  'border-glass-border flex flex-col gap-3 rounded-2xl border p-3.5',
                  summary.next?.id === cycle.id ? 'bg-info-subtle' : 'bg-glass-tile',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[15px] font-semibold">งวดที่ {cycle.cycleNumber}</span>
                    <span className="text-text-secondary text-xs">
                      ครบกำหนด {formatPaymentDate(cycle.dueDate)}
                      {hasManyPlans ? ` · ${cycle.plan.description}` : ''}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatMoney(cycle.amount)}
                  </span>
                </div>
                <CycleStatus cycle={cycle} />
                <div className="flex gap-2 empty:hidden [&>*]:flex-1">
                  <CycleActions cycle={cycle} {...actionProps} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <UploadProofDialog
        customerId={customerId}
        billingCycleId={uploadCycleId}
        open={!!uploadCycleId}
        onOpenChange={(open) => {
          if (!open) setUploadCycleId(null)
        }}
      />
    </Card>
  )
}

function CycleStatus({ cycle }: { cycle: BillingCycleWithPlan }) {
  const status = CYCLE_STATUS[cycle.status] ?? CYCLE_STATUS.PENDING
  const canUpload = cycle.status === 'PENDING' || cycle.status === 'OVERDUE'
  return (
    <div className="flex flex-col items-start gap-1">
      <StatusPill tone={status.tone}>{status.label}</StatusPill>
      {cycle.paidDate && (
        <span className="text-text-secondary text-xs">
          ชำระ {formatPaymentDate(cycle.paidDate)}
        </span>
      )}
      {canUpload && !cycle.hasInvoiceDocument && (
        <span className="text-text-secondary text-xs">รอทีมออกใบแจ้งหนี้ก่อนจึงอัปโหลดสลิปได้</span>
      )}
    </div>
  )
}

function CycleActions({
  cycle,
  downloadingCycleId,
  onUpload,
  onDownload,
}: {
  cycle: BillingCycleWithPlan
  downloadingCycleId?: string
  onUpload: (cycleId: string) => void
  onDownload: (cycleId: string, includeVat: boolean) => void
}) {
  const canUpload = cycle.status === 'PENDING' || cycle.status === 'OVERDUE'
  const isDownloading = downloadingCycleId === cycle.id

  return (
    <>
      {canUpload && (
        <Button
          className="h-11 rounded-[10px] px-3 text-[13px] md:h-9"
          disabled={!cycle.hasInvoiceDocument}
          onClick={() => onUpload(cycle.id)}
        >
          <Upload className="size-3.5" />
          อัปโหลดหลักฐาน
        </Button>
      )}
      {cycle.hasInvoiceDocument && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-11 rounded-[10px] px-3 text-[13px] md:h-9"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Download className="size-3.5" />
              )}
              ใบแจ้งหนี้
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDownload(cycle.id, false)}>
              ไม่รวม VAT
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload(cycle.id, true)}>
              รวม VAT 7%
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  )
}
