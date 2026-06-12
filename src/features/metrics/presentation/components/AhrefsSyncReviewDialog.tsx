'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Loader2, Minus, Pencil, Save } from 'lucide-react'
import { toast } from 'react-toastify'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

const FIELDS: { key: SyncField; label: string }[] = [
  { key: 'domainRating', label: 'Domain Rating' },
  { key: 'healthScore', label: 'Health Score' },
  { key: 'organicTraffic', label: 'Organic Traffic' },
  { key: 'organicKeywords', label: 'Organic Keywords' },
  { key: 'backlinks', label: 'Backlinks' },
  { key: 'refDomains', label: 'Referring Domains' },
]

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

const directionFor = (oldValue: number | undefined, nextValue: number | null) => {
  if (oldValue === undefined || nextValue === null || nextValue === oldValue) return 'same'
  return nextValue > oldValue ? 'up' : 'down'
}

const fmt = (value: number | null | undefined) =>
  value === null || value === undefined ? '—' : value.toLocaleString()

export function AhrefsSyncReviewDialog({
  open,
  onOpenChange,
  userId,
  customerName,
  proposed,
}: AhrefsSyncReviewDialogProps) {
  // ค่าปัจจุบันจาก source เดียวกับ MetricsModal (cache key ['customerReport', userId])
  const { data: report } = useGetCustomerReport(open ? userId : '')
  const current = report?.metrics ?? null
  const saveMetrics = useSaveMetrics()

  const [editMode, setEditMode] = useState(false)
  const [values, setValues] = useState<Record<SyncField, string>>(() => toInitialValues(proposed))

  // reset ทุกครั้งที่เปิด dialog ด้วยข้อเสนอใหม่
  useEffect(() => {
    if (open) {
      setValues(toInitialValues(proposed))
      setEditMode(false)
    }
  }, [open, proposed])

  const handleChange = (key: SyncField, raw: string) => {
    setValues((prev) => ({ ...prev, [key]: raw }))
  }

  const handleSave = async () => {
    const payload = FIELDS.reduce<Partial<OverallMetricsForm>>((acc, { key }) => {
      const raw = values[key]
      if (raw !== '' && Number.isFinite(Number(raw))) acc[key] = Number(raw)
      return acc
    }, {})

    await saveMetrics.mutateAsync({ customerId: userId, metrics: payload })
    toast.success('บันทึกค่าจาก Ahrefs แล้ว')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>เปรียบเทียบค่าจาก Ahrefs</DialogTitle>
          <DialogDescription>
            ลูกค้า: <span className="text-foreground font-bold">{customerName}</span> — ตรวจสอบค่าใหม่
            เทียบกับค่าเดิมก่อนบันทึก
          </DialogDescription>
        </DialogHeader>

        <div className="border-border overflow-hidden rounded-2xl border">
          <div className="text-muted-foreground bg-muted/40 grid grid-cols-[1.4fr_1fr_auto_1fr] items-center gap-2 px-4 py-2 text-xs font-medium">
            <span>ตัวชี้วัด</span>
            <span className="text-right">ค่าเดิม</span>
            <span />
            <span className="text-right">ค่าใหม่</span>
          </div>

          {FIELDS.map(({ key, label }, idx) => {
            const oldValue = current ? Number(current[key]) : undefined
            const raw = values[key]
            const nextValue = raw === '' ? null : Number(raw)
            const dir = directionFor(oldValue, nextValue)

            return (
              <div
                key={key}
                className={cn(
                  'grid grid-cols-[1.4fr_1fr_auto_1fr] items-center gap-2 px-4 py-2.5',
                  idx > 0 && 'border-border border-t',
                )}
              >
                <span className="text-sm font-medium">{label}</span>
                <span className="text-muted-foreground text-right text-sm tabular-nums">
                  {fmt(oldValue)}
                </span>
                <span className="flex w-5 justify-center">
                  {dir === 'up' && <ArrowUp className="text-secondary size-4" />}
                  {dir === 'down' && <ArrowDown className="text-muted-foreground size-4" />}
                  {dir === 'same' && <Minus className="text-muted-foreground size-4" />}
                </span>
                {editMode ? (
                  <Input
                    type="number"
                    min={0}
                    max={key === 'healthScore' || key === 'domainRating' ? 100 : undefined}
                    value={raw}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="h-8 text-right tabular-nums"
                    aria-label={label}
                  />
                ) : (
                  <span
                    className={cn(
                      'text-right text-sm font-bold tabular-nums',
                      dir === 'up' && 'text-secondary',
                    )}
                  >
                    {fmt(nextValue)}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saveMetrics.isPending}>
            ยกเลิก
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setEditMode(true)}
              disabled={editMode || saveMetrics.isPending}
            >
              <Pencil className="size-4" />
              เปลี่ยนแปลงค่า
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMetrics.isPending}
              className="bg-info text-info-foreground hover:bg-info/90"
            >
              {saveMetrics.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saveMetrics.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
