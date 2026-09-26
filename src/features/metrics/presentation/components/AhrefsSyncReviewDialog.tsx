'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Loader2, Pencil, RefreshCw, Save, X } from 'lucide-react'
import { toast } from 'react-toastify'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { OverallMetricsForm } from '@/types/metrics'
import type { AhrefsFullMetrics } from '@/features/metrics'
import { useGetCustomerReport } from '@/features/customer-report/presentation/hooks/useCustomerReport'
import { useSaveMetrics } from '../hooks/useMetrics'

type SyncField =
  | 'domainRating'
  | 'healthScore'
  | 'organicTraffic'
  | 'organicKeywords'
  | 'backlinks'
  | 'refDomains'

const FIELDS: { key: SyncField; label: string; max?: number }[] = [
  { key: 'domainRating', label: 'Domain Rating', max: 100 },
  { key: 'healthScore', label: 'Health Score', max: 100 },
  { key: 'organicTraffic', label: 'Organic Traffic' },
  { key: 'organicKeywords', label: 'Organic Keywords' },
  { key: 'backlinks', label: 'Backlinks' },
  { key: 'refDomains', label: 'Referring Domains' },
]

// dialog บนมือถือ = bottom sheet (rule 11)
const MOBILE_SHEET =
  'max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:max-h-[92dvh] max-sm:max-w-none! max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:data-open:slide-in-from-bottom-8'

interface AhrefsSyncReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string // = Customer.userId — ใช้ทั้ง query ค่าปัจจุบันและบันทึก
  customerName: string
  proposed: AhrefsFullMetrics
}

const toInitialValues = (proposed: AhrefsFullMetrics): Record<SyncField, string> => ({
  domainRating: String(proposed.domainRating),
  healthScore: proposed.healthScore === null ? '' : String(proposed.healthScore),
  organicTraffic: String(proposed.organicTraffic),
  organicKeywords: String(proposed.organicKeywords),
  backlinks: String(proposed.backlinks),
  refDomains: String(proposed.refDomains),
})

// ค่าที่ Ahrefs ไม่มีให้ (เช่น healthScore = null) เริ่มแบบไม่เลือก
const toInitialSelection = (proposed: AhrefsFullMetrics): Record<SyncField, boolean> => ({
  domainRating: true,
  healthScore: proposed.healthScore !== null,
  organicTraffic: true,
  organicKeywords: true,
  backlinks: true,
  refDomains: true,
})

const fmt = (value: number | null | undefined) =>
  value === null || value === undefined || Number.isNaN(value)
    ? '—'
    : value.toLocaleString('en-US', { maximumFractionDigits: 1 })

const rangeError = (raw: string, max?: number) => {
  if (raw === '') return null
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return 'ต้องเป็น 0 หรือมากกว่า'
  if (max !== undefined && n > max) return `ต้องไม่เกิน ${max}`
  return null
}

/** ชิปการเปลี่ยนแปลง — ค่าทุกตัวในชุดนี้ "มากขึ้น = ดีขึ้น" จึงขึ้นเขียว ลงแดง (rule 8) */
function DeltaChip({ oldValue, nextValue }: { oldValue?: number; nextValue: number | null }) {
  if (nextValue === null || Number.isNaN(nextValue)) {
    return <span className="text-text-secondary text-xs">ไม่มีค่าใหม่</span>
  }
  if (oldValue === undefined || Number.isNaN(oldValue)) {
    return (
      <span className="bg-info-subtle text-foreground inline-flex rounded-full px-2 py-0.5 text-xs font-semibold">
        ค่าใหม่
      </span>
    )
  }
  const diff = nextValue - oldValue
  if (diff === 0) {
    return (
      <span className="bg-muted text-text-secondary inline-flex rounded-full px-2 py-0.5 text-xs font-semibold">
        ไม่เปลี่ยน
      </span>
    )
  }
  const up = diff > 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap tabular-nums',
        up ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger-strong',
      )}
    >
      {up ? (
        <ArrowUp aria-hidden className="size-3" />
      ) : (
        <ArrowDown aria-hidden className="size-3" />
      )}
      <span className="sr-only">{up ? 'เพิ่มขึ้น' : 'ลดลง'}</span>
      {up ? '+' : '−'}
      {fmt(Math.abs(diff))}
    </span>
  )
}

export function AhrefsSyncReviewDialog({
  open,
  onOpenChange,
  userId,
  customerName,
  proposed,
}: AhrefsSyncReviewDialogProps) {
  // ค่าปัจจุบันจาก source เดียวกับหน้าจัดการ Domain (cache key ['customerReport', userId])
  const { data: report, isLoading: isLoadingCurrent } = useGetCustomerReport(open ? userId : '')
  const current = report?.metrics ?? null
  const saveMetrics = useSaveMetrics()

  const [editMode, setEditMode] = useState(false)
  const [values, setValues] = useState<Record<SyncField, string>>(() => toInitialValues(proposed))
  const [selected, setSelected] = useState<Record<SyncField, boolean>>(() =>
    toInitialSelection(proposed),
  )
  const [saveFailed, setSaveFailed] = useState(false)

  // reset ทุกครั้งที่เปิด dialog ด้วยข้อเสนอใหม่
  useEffect(() => {
    if (open) {
      setValues(toInitialValues(proposed))
      setSelected(toInitialSelection(proposed))
      setEditMode(false)
      setSaveFailed(false)
    }
  }, [open, proposed])

  const handleChange = (key: SyncField, raw: string) => {
    // ช่องที่เคยว่าง (Ahrefs ไม่มีค่า) พอกรอกเองแล้วให้ติ๊กเลือกบันทึกให้เลย
    if (values[key] === '' && raw !== '') setSelected((prev) => ({ ...prev, [key]: true }))
    setValues((prev) => ({ ...prev, [key]: raw }))
  }

  const isSaveable = (key: SyncField) => selected[key] && values[key] !== ''
  const selectedCount = FIELDS.filter(({ key }) => isSaveable(key)).length
  const hasInvalid = FIELDS.some(({ key, max }) => isSaveable(key) && rangeError(values[key], max))

  const handleSave = async () => {
    const payload = FIELDS.reduce<Partial<OverallMetricsForm>>((acc, { key }) => {
      const raw = values[key]
      if (selected[key] && raw !== '' && Number.isFinite(Number(raw))) acc[key] = Number(raw)
      return acc
    }, {})

    setSaveFailed(false)
    try {
      await saveMetrics.mutateAsync({ customerId: userId, metrics: payload })
    } catch {
      // error ถูก toast จาก axios interceptor แล้ว — คง dialog ไว้ให้ลองใหม่
      setSaveFailed(true)
      return
    }
    toast.success('บันทึกค่าจาก Ahrefs แล้ว')
    onOpenChange(false)
  }

  const rows = FIELDS.map(({ key, label, max }) => {
    const rawOld = current?.[key]
    const oldValue = rawOld === null || rawOld === undefined ? undefined : Number(rawOld)
    const raw = values[key]
    const nextValue = raw === '' ? null : Number(raw)
    return {
      key,
      label,
      max,
      oldValue,
      raw,
      nextValue,
      checked: selected[key],
      disabled: raw === '',
      error: rangeError(raw, max),
    }
  })

  const renderCheckbox = (row: (typeof rows)[number], id: string) => (
    <Checkbox
      id={id}
      checked={row.checked && !row.disabled}
      disabled={row.disabled || saveMetrics.isPending}
      onCheckedChange={(c) => setSelected((prev) => ({ ...prev, [row.key]: c === true }))}
      aria-label={`บันทึก ${row.label}`}
    />
  )

  const renderNewValue = (row: (typeof rows)[number], errorId: string) =>
    editMode ? (
      <div className="flex flex-col items-end gap-1">
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          max={row.max}
          value={row.raw}
          onChange={(e) => handleChange(row.key, e.target.value)}
          aria-label={`ค่าใหม่ ${row.label}`}
          aria-invalid={Boolean(row.error)}
          aria-describedby={row.error ? errorId : undefined}
          className="h-9 rounded-[10px] text-right tabular-nums"
        />
        {row.error && (
          <span id={errorId} className="text-danger-strong text-xs">
            {row.error}
          </span>
        )}
      </div>
    ) : (
      <span className="block text-right font-semibold tabular-nums">{fmt(row.nextValue)}</span>
    )

  const renderOldValue = (row: (typeof rows)[number]) =>
    isLoadingCurrent ? (
      <Skeleton className="ml-auto h-4 w-12" />
    ) : (
      <span className="text-text-secondary block text-right tabular-nums">{fmt(row.oldValue)}</span>
    )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        showCloseButton={false}
        className={cn('max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-[720px]', MOBILE_SHEET)}
      >
        <div className="flex items-start gap-3.5 px-6 pt-[22px] pb-[18px]">
          <span
            aria-hidden
            className="bg-primary text-secondary dark:bg-background flex size-11 shrink-0 items-center justify-center rounded-[14px]"
          >
            <RefreshCw className="size-5" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <DialogTitle>เปรียบเทียบค่าจาก Ahrefs</DialogTitle>
            <DialogDescription>
              <span className="text-foreground font-medium">{customerName || 'ลูกค้า'}</span> ·
              ตรวจค่าใหม่เทียบค่าเดิม แล้วเลือกค่าที่จะบันทึกทับ
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button variant="outline" size="icon-sm" aria-label="ปิด" className="max-sm:size-11">
              <X />
            </Button>
          </DialogClose>
        </div>

        <div className="flex flex-col gap-4 px-6 pt-1 pb-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-text-secondary text-[13px]">
              ค่าที่ไม่ได้เลือกจะคงค่าเดิมไว้ · แก้ตัวเลขก่อนบันทึกได้
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(true)}
              disabled={editMode || saveMetrics.isPending}
              className="self-start max-sm:h-11 sm:self-auto"
            >
              <Pencil />
              เปลี่ยนแปลงค่า
            </Button>
          </div>

          {/* ≥ sm: ตาราง */}
          <table className="hidden w-full table-fixed border-collapse text-sm sm:table">
            <caption className="sr-only">เปรียบเทียบค่าเดิมกับค่าใหม่จาก Ahrefs</caption>
            <thead>
              <tr className="border-border text-text-secondary border-b text-xs font-medium">
                <th scope="col" className="w-14 px-3.5 py-3 text-left font-medium">
                  <span className="sr-only">เลือกบันทึก</span>
                </th>
                <th scope="col" className="px-3.5 py-3 text-left font-medium">
                  ตัวชี้วัด
                </th>
                <th scope="col" className="w-[110px] px-3.5 py-3 text-right font-medium">
                  ค่าเดิม
                </th>
                <th scope="col" className="w-[130px] px-3.5 py-3 text-right font-medium">
                  ค่าใหม่
                </th>
                <th scope="col" className="w-[120px] px-3.5 py-3 text-right font-medium">
                  เปลี่ยนแปลง
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.key}
                  className={cn(
                    'border-border/80 border-b transition-opacity',
                    (!row.checked || row.disabled) && 'opacity-55',
                  )}
                >
                  <td className="px-3.5 py-3 align-middle">
                    {renderCheckbox(row, `ahrefs-d-${row.key}`)}
                  </td>
                  <td className="px-3.5 py-3 align-middle font-medium">
                    <label htmlFor={`ahrefs-d-${row.key}`}>{row.label}</label>
                  </td>
                  <td className="px-3.5 py-3 align-middle">{renderOldValue(row)}</td>
                  <td className="px-3.5 py-3 align-middle">
                    {renderNewValue(row, `ahrefs-d-${row.key}-error`)}
                  </td>
                  <td className="px-3.5 py-3 text-right align-middle">
                    <DeltaChip oldValue={row.oldValue} nextValue={row.nextValue} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* < sm: การ์ดรายการ (rule 6) */}
          <ul className="flex flex-col gap-2 sm:hidden">
            {rows.map((row) => (
              <li
                key={row.key}
                className={cn(
                  'bg-glass-tile border-glass-border flex flex-col gap-2 rounded-2xl border px-3.5 py-3 transition-opacity',
                  (!row.checked || row.disabled) && 'opacity-55',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor={`ahrefs-m-${row.key}`}
                    className="flex min-h-11 flex-1 cursor-pointer items-center gap-3 font-medium"
                  >
                    {renderCheckbox(row, `ahrefs-m-${row.key}`)}
                    {row.label}
                  </label>
                  <DeltaChip oldValue={row.oldValue} nextValue={row.nextValue} />
                </div>
                <div className="grid grid-cols-2 items-start gap-3 pl-[34px] text-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-text-secondary text-xs">ค่าเดิม</span>
                    {isLoadingCurrent ? (
                      <Skeleton className="h-4 w-12" />
                    ) : (
                      <span className="text-text-secondary tabular-nums">{fmt(row.oldValue)}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-text-secondary text-right text-xs">ค่าใหม่</span>
                    {renderNewValue(row, `ahrefs-m-${row.key}-error`)}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {saveFailed && (
            <p
              role="alert"
              className="bg-danger-subtle text-danger-strong rounded-xl px-3.5 py-2.5 text-sm"
            >
              บันทึกไม่สำเร็จ — ค่าที่เลือกยังอยู่ครบ ตรวจการเชื่อมต่อแล้วกดบันทึกอีกครั้ง
            </p>
          )}
        </div>

        <div className="bg-muted/60 border-border sticky bottom-0 flex flex-col gap-3 border-t px-6 py-4 backdrop-blur-[14px] sm:flex-row sm:items-center sm:justify-between">
          <span className="text-text-secondary text-xs tabular-nums" aria-live="polite">
            เลือก {selectedCount} จาก {FIELDS.length} ค่า
            {hasInvalid && ' · แก้ค่าที่ไม่ถูกต้องก่อนบันทึก'}
          </span>
          <div className="grid grid-cols-2 gap-2.5 sm:flex">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saveMetrics.isPending}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMetrics.isPending || selectedCount === 0 || hasInvalid}
            >
              {saveMetrics.isPending ? <Loader2 className="animate-spin" /> : <Save />}
              {saveMetrics.isPending ? 'กำลังบันทึก...' : `บันทึก ${selectedCount} ค่า`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
