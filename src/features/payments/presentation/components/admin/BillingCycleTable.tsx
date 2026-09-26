'use client'

import { useState } from 'react'
import { CheckCircle, MoreHorizontal, Search, TriangleAlert, Undo2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useListBillingCycles, useUpdateBillingCycle } from '../../hooks/useBillingCycles'
import { UploadProofDialog } from '../customer/UploadProofDialog'
import { StatusPill } from '../shared/StatusPill'
import {
  CYCLE_STATUS,
  formatAmount,
  formatMoney,
  formatPaymentDate,
  PROOF_SECTION_ID,
  summarizeCycles,
} from '../shared/payment-view'
import type { BillingCycleWithPlan } from '../../../index'

interface BillingCycleTableProps {
  customerId: string
  planId?: string
}

export function BillingCycleTable({ customerId, planId }: BillingCycleTableProps) {
  const [uploadCycleId, setUploadCycleId] = useState<string | null>(null)
  const { data: cycles, isLoading, isError, refetch } = useListBillingCycles(customerId, planId)
  const updateMutation = useUpdateBillingCycle()

  const handleMarkPaid = (cycleId: string) => {
    updateMutation.mutate({
      customerId,
      cycleId,
      data: { status: 'PAID', paidDate: new Date() },
    })
  }

  const handleMarkOverdue = (cycleId: string) => {
    updateMutation.mutate({
      customerId,
      cycleId,
      data: { status: 'OVERDUE' },
    })
  }

  const handleRevertToPending = (cycleId: string) => {
    updateMutation.mutate({
      customerId,
      cycleId,
      data: { status: 'PENDING', paidDate: null },
    })
  }

  const summary = summarizeCycles(cycles ?? [])
  const hasManyPlans = new Set(cycles?.map((cycle) => cycle.planId)).size > 1

  const actions: RowActionHandlers = {
    isPending: updateMutation.isPending,
    onMarkPaid: handleMarkPaid,
    onMarkOverdue: handleMarkOverdue,
    onRevert: handleRevertToPending,
    onUpload: setUploadCycleId,
  }

  return (
    <Card
      role="region"
      aria-labelledby="billing-cycles-title"
      className="min-w-0 gap-4 px-4 py-5 sm:px-5"
    >
      <div className="flex flex-col gap-1 px-1">
        <h2 id="billing-cycles-title" className="text-[17px] font-semibold">
          รอบจ่ายเงิน
        </h2>
        <p className="text-text-secondary text-[13px]">
          {isLoading
            ? 'กำลังโหลดรอบจ่ายเงิน…'
            : cycles?.length
              ? `${summary.totalCount} งวด · ชำระแล้ว ${summary.paidCount} งวด${summary.overdueCount > 0 ? ` · เกินกำหนด ${summary.overdueCount} งวด` : ''} · อัปเดตสถานะได้จากปุ่มท้ายแถว`
              : 'รอบจ่ายเงินจะขึ้นที่นี่หลังสร้างแผนชำระเงิน'}
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
          ยังไม่มีรอบจ่ายเงิน — สร้างแผนชำระเงินก่อน
        </p>
      ) : (
        <>
          {/* จอกว้าง: ตาราง */}
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
                  <TableHead className="box-border w-[172px]">
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
                      <div className="flex items-center justify-end gap-1.5">
                        <CycleActions cycle={cycle} {...actions} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* จอเล็ก: การ์ดทีละงวด */}
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
                <div className="flex items-center gap-2 [&>*:first-child:not(:last-child)]:flex-1">
                  <CycleActions cycle={cycle} {...actions} />
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
  return (
    <div className="flex flex-col items-start gap-1">
      <StatusPill tone={status.tone}>{status.label}</StatusPill>
      {cycle.paidDate && (
        <span className="text-text-secondary text-xs">
          ชำระ {formatPaymentDate(cycle.paidDate)}
        </span>
      )}
    </div>
  )
}

interface RowActionHandlers {
  isPending: boolean
  onMarkPaid: (cycleId: string) => void
  onMarkOverdue: (cycleId: string) => void
  onRevert: (cycleId: string) => void
  onUpload: (cycleId: string) => void
}

/** ปุ่มหลักของแถว (ถ้ามี) + เมนูตัวเลือกที่เหลือ — ทุกคำสั่งเดิมยังอยู่ครบ */
function CycleActions({
  cycle,
  isPending,
  onMarkPaid,
  onMarkOverdue,
  onRevert,
  onUpload,
}: { cycle: BillingCycleWithPlan } & RowActionHandlers) {
  const canRevert = cycle.status !== 'PENDING'

  return (
    <>
      {cycle.status === 'PENDING' && (
        <Button
          variant="outline"
          className="h-11 rounded-[10px] px-3 text-[13px] md:h-9"
          onClick={() => onMarkPaid(cycle.id)}
          disabled={isPending}
        >
          <CheckCircle className="size-3.5" />
          ชำระแล้ว
        </Button>
      )}
      {cycle.status === 'REVIEWING' && (
        <Button
          asChild
          variant="outline"
          className="bg-info-subtle hover:bg-info-subtle/80 h-11 rounded-[10px] border-transparent px-3 text-[13px] md:h-9"
        >
          <a href={`#${PROOF_SECTION_ID}`}>
            <Search className="size-3.5" />
            ตรวจหลักฐาน
          </a>
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="size-11 shrink-0 rounded-[10px] p-0 md:size-9"
            aria-label={`ตัวเลือกงวดที่ ${cycle.cycleNumber}`}
            disabled={isPending}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuItem onClick={() => onUpload(cycle.id)}>
            <Upload className="size-4" />
            อัปโหลดหลักฐานแทนลูกค้า
          </DropdownMenuItem>
          {canRevert && (
            <DropdownMenuItem onClick={() => onRevert(cycle.id)}>
              <Undo2 className="size-4" />
              ย้อนสถานะเป็นรอชำระ
            </DropdownMenuItem>
          )}
          {cycle.status === 'PENDING' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onMarkOverdue(cycle.id)}>
                <TriangleAlert className="size-4" />
                ทำเครื่องหมายเกินกำหนด
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
