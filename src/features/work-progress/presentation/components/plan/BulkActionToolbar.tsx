'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'
import { ChevronDown, Trash2, X } from 'lucide-react'
import { motion } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfirmAlert } from '@/components/shared/ConfirmAlert'
import { useStatuses, useMarkTypes } from '../../hooks/useMasterTables'
import {
  useBulkUpdateItemStatus,
  useBulkDeleteItems,
  useBulkSetPeriodAcrossItems,
} from '../../hooks/useItemMutations'
import type { WorkProgressPeriod } from '@/features/work-progress'

type BulkMarkMode = 'set' | 'clear'

interface BulkActionToolbarProps {
  userId: string
  planId: string
  periods: WorkProgressPeriod[]
  selectedIds: string[]
  onClear: () => void
}

// ปุ่มบนแถบมืด — พื้นขาวโปร่ง ตัวอักษรขาว
const DARK_BTN =
  'h-9 rounded-[10px] bg-white/12 px-3 text-[13px] text-white hover:bg-white/20 hover:text-white aria-expanded:bg-white/20 aria-expanded:text-white focus-visible:ring-white/60 focus-visible:ring-offset-0'

export function BulkActionToolbar({
  userId,
  planId,
  periods,
  selectedIds,
  onClear,
}: BulkActionToolbarProps) {
  const { data: statuses = [] } = useStatuses()
  const { data: markTypes = [] } = useMarkTypes()
  const bulkStatus = useBulkUpdateItemStatus()
  const bulkDelete = useBulkDeleteItems()
  const bulkPeriod = useBulkSetPeriodAcrossItems()

  const [statusOpen, setStatusOpen] = useState(false)
  const [periodOpen, setPeriodOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [statusId, setStatusId] = useState<string>('')
  const [periodId, setPeriodId] = useState<string>(periods[0]?.id ?? '')
  const [markMode, setMarkMode] = useState<BulkMarkMode>('set')

  const defaultMarkTypeId = markTypes.find((m) => m.isActive)?.id ?? null

  const applyStatus = async () => {
    if (!statusId) return
    await bulkStatus.mutateAsync({
      userId,
      planId,
      body: { itemIds: selectedIds, statusId },
    })
    toast.success(`อัปเดตสถานะ ${selectedIds.length} รายการ`)
    setStatusOpen(false)
    onClear()
  }

  const applyPeriod = async () => {
    if (!periodId) return
    const resolvedMarkTypeId = markMode === 'clear' ? null : defaultMarkTypeId
    if (markMode === 'set' && !resolvedMarkTypeId) return
    await bulkPeriod.mutateAsync({
      userId,
      planId,
      body: {
        periodId,
        itemIds: selectedIds,
        markTypeId: resolvedMarkTypeId,
      },
    })
    toast.success(`ตั้ง mark ${selectedIds.length} ช่อง`)
    setPeriodOpen(false)
    onClear()
  }

  const applyDelete = async () => {
    await bulkDelete.mutateAsync({
      userId,
      planId,
      body: { itemIds: selectedIds },
    })
    toast.success(`ลบ ${selectedIds.length} รายการ`)
    setConfirmDelete(false)
    onClear()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      className="pointer-events-none sticky bottom-4 z-30 flex justify-center"
    >
      <div
        role="toolbar"
        aria-label="จัดการรายการที่เลือก"
        className="bg-toast shadow-toast pointer-events-auto flex max-w-full flex-wrap items-center gap-2 rounded-[16px] py-2 pr-2 pl-4 text-white"
      >
        <span className="text-sm font-medium tabular-nums" aria-live="polite">
          เลือก {selectedIds.length} รายการ
        </span>
        <span aria-hidden className="h-5 w-px bg-white/25" />

        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className={DARK_BTN}>
              เปลี่ยนสถานะ
              <ChevronDown className="size-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 rounded-[16px]">
            <div className="flex flex-col gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="bulk-status" className="text-[13px]">
                  สถานะใหม่ของ {selectedIds.length} รายการ
                </Label>
                <Select value={statusId} onValueChange={setStatusId}>
                  <SelectTrigger id="bulk-status" className="w-full">
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses
                      .filter((s) => s.isActive)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          <span
                            aria-hidden
                            className="inline-block size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: s.color ?? 'var(--muted-foreground)' }}
                          />
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setStatusOpen(false)}>
                  ยกเลิก
                </Button>
                <Button
                  size="sm"
                  onClick={applyStatus}
                  disabled={!statusId || bulkStatus.isPending}
                >
                  {bulkStatus.isPending ? 'กำลังบันทึก...' : 'ยืนยัน'}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={periodOpen} onOpenChange={setPeriodOpen}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className={DARK_BTN}>
              Mark period
              <ChevronDown className="size-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 rounded-[16px]">
            <div className="flex flex-col gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="bulk-period" className="text-[13px]">
                  รอบที่ต้องการ
                </Label>
                <Select value={periodId} onValueChange={setPeriodId}>
                  <SelectTrigger id="bulk-period" className="w-full">
                    <SelectValue placeholder="เลือก period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="bulk-mark-mode" className="text-[13px]">
                  การกระทำ
                </Label>
                <Select value={markMode} onValueChange={(v) => setMarkMode(v as BulkMarkMode)}>
                  <SelectTrigger id="bulk-mark-mode" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="set">ตั้ง mark</SelectItem>
                    <SelectItem value="clear">ล้าง mark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {markMode === 'set' && !defaultMarkTypeId && (
                <p className="text-warning-text text-xs">
                  ยังไม่มีประเภท mark ที่เปิดใช้ — เปิดได้ที่หน้าตั้งค่า Work Progress
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setPeriodOpen(false)}>
                  ยกเลิก
                </Button>
                <Button
                  size="sm"
                  onClick={applyPeriod}
                  disabled={
                    !periodId || bulkPeriod.isPending || (markMode === 'set' && !defaultMarkTypeId)
                  }
                >
                  {bulkPeriod.isPending ? 'กำลังบันทึก...' : 'ยืนยัน'}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          size="sm"
          variant="ghost"
          className="bg-destructive/30 hover:bg-destructive/45 h-9 rounded-[10px] px-3 text-[13px] text-white hover:text-white focus-visible:ring-white/60 focus-visible:ring-offset-0"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="size-4" />
          ลบ
        </Button>

        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="ยกเลิกการเลือก"
          className="text-white hover:bg-white/15 hover:text-white focus-visible:ring-white/60 focus-visible:ring-offset-0"
          onClick={onClear}
        >
          <X className="size-4" />
        </Button>
      </div>

      <ConfirmAlert
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={applyDelete}
        title={`ลบ ${selectedIds.length} รายการ`}
        message="ลบรายการที่เลือกพร้อม marks / subtasks / attachments ทั้งหมด — การกระทำนี้ย้อนกลับไม่ได้"
      />
    </motion.div>
  )
}
