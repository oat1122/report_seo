'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { History, ImageIcon, Pencil, Search, SearchX, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AnimatePresence, EASE_OUT, motion } from '@/components/motion'
import { cn } from '@/lib/utils'
import type { KdLevel } from '@/types/kd'
import type { KeywordReport, KeywordReportForm } from '@/types/metrics'
import { KeywordEvidenceManager } from '@/features/keywords/presentation/components/KeywordEvidenceManager'
import { MAX_KEYWORD_EVIDENCE_IMAGES } from '@/features/keywords/schemas'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { KdBadge } from './KdBadge'
import { KeywordMobileCard } from './KeywordMobileCard'
import { checkboxChangeEvent, formatPosition } from './domainFormat'
import { KD_META, KD_OPTIONS } from './kdMeta'

const TH =
  'border-border text-text-secondary border-b px-3 py-3 text-left text-xs font-medium whitespace-nowrap'
const TD = 'border-border/80 border-b px-3 py-3 align-middle'
const EDIT_INPUT = 'h-9 rounded-[10px] border-info px-2.5'

const ROW_MOTION = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: { duration: 0.22, ease: EASE_OUT },
} as const

interface KeywordReportTableProps {
  customerId: string
  keywords: KeywordReport[]
  isLoading: boolean
  editingKeywordId: string | null
  /** state ฟอร์มจาก useMetricsModal — ใช้เป็นค่าของแถวที่กำลังแก้ */
  draft: KeywordReportForm
  onDraftChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDraftKdChange: (value: KdLevel) => void
  onSave: () => void
  onCancelEdit: () => void
  onEdit: (keyword: KeywordReport) => void
  onDelete: (id: string) => void
  onViewHistory: (keyword: KeywordReport) => void
}

/**
 * รายการ Keyword Report — ตาราง (คอลัมน์เนื้อหา ≥ 672px) แก้ไขในแถวได้ · จอแคบเป็นการ์ด (rule 6)
 * กว้าง/แคบตัดสินด้วย @container ของคอลัมน์เนื้อหา เพราะมีทั้ง sidebar และเมนูหมวดกินที่
 */
export function KeywordReportTable({
  customerId,
  keywords,
  isLoading,
  editingKeywordId,
  draft,
  onDraftChange,
  onDraftKdChange,
  onSave,
  onCancelEdit,
  onEdit,
  onDelete,
  onViewHistory,
}: KeywordReportTableProps) {
  const [query, setQuery] = useState('')
  const [evidenceOpenId, setEvidenceOpenId] = useState<string | null>(null)
  // แยก target กับ open เพื่อให้ข้อความใน dialog ไม่หายระหว่าง animation ปิด
  const [deleteTarget, setDeleteTarget] = useState<KeywordReport | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [showEditError, setShowEditError] = useState(false)
  const desktopEditRef = useRef<HTMLInputElement>(null)
  const mobileEditRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? keywords.filter((k) => k.keyword.toLowerCase().includes(q)) : keywords
  }, [keywords, query])

  // เริ่มแก้แถวไหน → โฟกัสช่อง Keyword ของแถวนั้น (เลือกตัวที่มองเห็นอยู่ — ตารางหรือการ์ด)
  useEffect(() => {
    if (!editingKeywordId) return
    const visible = [desktopEditRef.current, mobileEditRef.current].find(
      (el) => el && el.offsetParent !== null,
    )
    visible?.focus()
  }, [editingKeywordId])

  const editError = showEditError && !draft.keyword.trim()

  const handleSave = () => {
    if (!draft.keyword.trim()) {
      setShowEditError(true)
      return
    }
    setShowEditError(false)
    onSave()
  }

  const handleCancel = () => {
    setShowEditError(false)
    onCancelEdit()
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  const toggleEvidence = (id: string) => setEvidenceOpenId((cur) => (cur === id ? null : id))

  const askDelete = (kw: KeywordReport) => {
    setDeleteTarget(kw)
    setDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    const { id } = deleteTarget
    if (editingKeywordId === id) onCancelEdit()
    if (evidenceOpenId === id) setEvidenceOpenId(null)
    onDelete(id)
    setDeleteOpen(false)
  }

  const renderViewRow = (kw: KeywordReport) => {
    const evidenceOpen = evidenceOpenId === kw.id
    return (
      <motion.tr key={kw.id} {...ROW_MOTION} className="hover:bg-white/50 dark:hover:bg-white/5">
        <td className={TD}>
          <div className="flex min-w-0 flex-col items-start gap-1">
            <span className="font-medium break-words">{kw.keyword}</span>
            <button
              type="button"
              onClick={() => toggleEvidence(kw.id)}
              aria-expanded={evidenceOpen}
              aria-controls={`kw-evidence-d-${kw.id}`}
              className="text-text-secondary hover:text-foreground focus-visible:ring-ring/70 inline-flex items-center gap-1 rounded-md text-xs outline-none focus-visible:ring-[3px]"
            >
              <ImageIcon aria-hidden className="size-3.5" />
              รูปหลักฐาน {kw.images.length}/{MAX_KEYWORD_EVIDENCE_IMAGES}
            </button>
          </div>
        </td>
        <td className={cn(TD, 'font-semibold tabular-nums')}>{formatPosition(kw.position)}</td>
        <td className={cn(TD, 'text-right tabular-nums')}>
          {Number(kw.traffic).toLocaleString('en-US')}
        </td>
        <td className={TD}>
          <KdBadge kd={kw.kd} />
        </td>
        <td className={cn(TD, 'text-center')}>
          {kw.isTopReport ? (
            <span title="แสดงใน Top Report" className="inline-flex">
              <Star aria-hidden className="fill-warning-accent text-warning-text size-[17px]" />
              <span className="sr-only">แสดงใน Top Report</span>
            </span>
          ) : (
            <span className="text-muted-foreground">
              <span aria-hidden>—</span>
              <span className="sr-only">ไม่แสดงใน Top Report</span>
            </span>
          )}
        </td>
        <td className={TD}>
          <div className="flex justify-end gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="outline"
                  aria-label={`ดูประวัติ ${kw.keyword}`}
                  onClick={() => onViewHistory(kw)}
                >
                  <History />
                </Button>
              </TooltipTrigger>
              <TooltipContent>ดูประวัติ</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="outline"
                  aria-label={`แก้ไข ${kw.keyword}`}
                  onClick={() => {
                    setShowEditError(false)
                    onEdit(kw)
                  }}
                >
                  <Pencil />
                </Button>
              </TooltipTrigger>
              <TooltipContent>แก้ไข</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="destructive-subtle"
                  aria-label={`ลบ ${kw.keyword}`}
                  onClick={() => askDelete(kw)}
                >
                  <Trash2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>ลบ</TooltipContent>
            </Tooltip>
          </div>
        </td>
      </motion.tr>
    )
  }

  const renderEditRow = (kw: KeywordReport) => (
    <motion.tr key={kw.id} {...ROW_MOTION} className="bg-info-subtle">
      <td className={TD}>
        <Input
          ref={desktopEditRef}
          name="keyword"
          aria-label="Keyword"
          value={draft.keyword}
          onChange={onDraftChange}
          onKeyDown={handleEditKeyDown}
          aria-invalid={editError}
          aria-describedby={editError ? 'kw-edit-d-error' : undefined}
          className={EDIT_INPUT}
        />
        {editError && (
          <p id="kw-edit-d-error" role="alert" className="text-danger-strong mt-1 text-xs">
            กรอก Keyword ก่อนบันทึก
          </p>
        )}
      </td>
      <td className={TD}>
        <div className="flex flex-col gap-1">
          <Input
            name="position"
            type="number"
            inputMode="numeric"
            min={0}
            aria-label="Position"
            value={draft.position ?? ''}
            onChange={onDraftChange}
            onKeyDown={handleEditKeyDown}
            className={cn(EDIT_INPUT, 'w-16 text-right tabular-nums')}
          />
          <span className="text-text-secondary text-[11px]">
            เดิม {formatPosition(kw.position)}
          </span>
        </div>
      </td>
      <td className={TD}>
        <Input
          name="traffic"
          type="number"
          inputMode="numeric"
          min={0}
          aria-label="Traffic"
          value={draft.traffic}
          onChange={onDraftChange}
          onKeyDown={handleEditKeyDown}
          className={cn(EDIT_INPUT, 'text-right tabular-nums')}
        />
      </td>
      <td className={TD}>
        <Select value={draft.kd} onValueChange={(v) => onDraftKdChange(v as KdLevel)}>
          <SelectTrigger size="sm" aria-label="KD" className="border-info w-full px-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {KD_OPTIONS.map((level) => (
              <SelectItem key={level} value={level}>
                {KD_META[level].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className={cn(TD, 'text-center')}>
        <Checkbox
          aria-label="แสดงใน Top Report"
          checked={draft.isTopReport}
          onCheckedChange={(c) => onDraftChange(checkboxChangeEvent('isTopReport', c === true))}
          className="mx-auto"
        />
      </td>
      <td className={TD}>
        <div className="flex justify-end gap-1.5">
          <Button size="sm" variant="outline" onClick={handleCancel} className="px-2.5">
            ยกเลิก
          </Button>
          <Button size="sm" onClick={handleSave} className="px-3">
            บันทึก
          </Button>
        </div>
      </td>
    </motion.tr>
  )

  const renderEvidenceRow = (kw: KeywordReport) => (
    <motion.tr key={`${kw.id}-evidence`} {...ROW_MOTION}>
      <td colSpan={6} className={cn(TD, 'bg-glass-tile')}>
        <div id={`kw-evidence-d-${kw.id}`} className="flex flex-col gap-1">
          <span className="text-text-secondary text-xs">
            รูปหลักฐานอันดับของ “{kw.keyword}” · JPG / PNG สูงสุด {MAX_KEYWORD_EVIDENCE_IMAGES} รูป
          </span>
          <KeywordEvidenceManager customerId={customerId} keywordId={kw.id} images={kw.images} />
        </div>
      </td>
    </motion.tr>
  )

  const hasQuery = query.trim().length > 0

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 @xl:flex-row @xl:items-start @xl:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle>
            <h3>รายการคีย์เวิร์ดที่บันทึกแล้ว ({keywords.length.toLocaleString('en-US')})</h3>
          </CardTitle>
          <CardDescription>
            แก้ไขในแถวได้ทันที · บันทึกแล้วลูกค้าเห็นในรายงานรอบถัดไป
          </CardDescription>
        </div>
        <div className="relative w-full @xl:w-60 @xl:shrink-0">
          <Search
            aria-hidden
            className="text-text-secondary pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <Input
            type="search"
            aria-label="ค้นหา keyword"
            placeholder="ค้นหา keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-2" aria-busy="true" aria-label="กำลังโหลด Keyword">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : keywords.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center">
            <Search aria-hidden className="text-info-strong size-6" />
            <p className="font-medium">ยังไม่มี Keyword ในรายงาน</p>
            <p className="text-text-secondary text-[13px]">
              เพิ่ม Keyword แรกจากฟอร์มด้านบน แล้วลูกค้าจะเห็นในรายงานรอบถัดไป
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center">
            <SearchX aria-hidden className="text-text-secondary size-6" />
            <p className="font-medium">ไม่พบ Keyword ที่ตรงกับ “{query.trim()}”</p>
            <Button variant="ghost" onClick={() => setQuery('')}>
              ล้างคำค้นหา
            </Button>
          </div>
        ) : (
          <>
            <table className="hidden w-full table-fixed border-collapse text-sm @2xl:table">
              <caption className="sr-only">
                รายการ Keyword Report{hasQuery ? ` ที่ตรงกับ “${query.trim()}”` : ''}
              </caption>
              <thead>
                <tr>
                  <th scope="col" className={TH}>
                    Keyword
                  </th>
                  <th scope="col" className={cn(TH, 'w-[120px]')}>
                    Position
                  </th>
                  <th scope="col" className={cn(TH, 'w-24 text-right')}>
                    Traffic
                  </th>
                  <th scope="col" className={cn(TH, 'w-28')}>
                    KD
                  </th>
                  <th scope="col" className={cn(TH, 'w-14 text-center')}>
                    Top
                  </th>
                  <th scope="col" className={cn(TH, 'w-[156px]')}>
                    <span className="sr-only">การจัดการ</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filtered.flatMap((kw) => {
                    const row = kw.id === editingKeywordId ? renderEditRow(kw) : renderViewRow(kw)
                    return evidenceOpenId === kw.id ? [row, renderEvidenceRow(kw)] : [row]
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            <ul className="flex flex-col gap-3 @2xl:hidden">
              <AnimatePresence initial={false}>
                {filtered.map((kw) => (
                  <KeywordMobileCard
                    key={kw.id}
                    customerId={customerId}
                    keyword={kw}
                    isEditing={kw.id === editingKeywordId}
                    evidenceOpen={evidenceOpenId === kw.id}
                    draft={draft}
                    editError={editError}
                    editInputRef={mobileEditRef}
                    onDraftChange={onDraftChange}
                    onDraftKdChange={onDraftKdChange}
                    onEditKeyDown={handleEditKeyDown}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onToggleEvidence={() => toggleEvidence(kw.id)}
                    onEdit={() => {
                      setShowEditError(false)
                      onEdit(kw)
                    }}
                    onDelete={() => askDelete(kw)}
                    onViewHistory={() => onViewHistory(kw)}
                  />
                ))}
              </AnimatePresence>
            </ul>
          </>
        )}
      </CardContent>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`ลบ Keyword “${deleteTarget?.keyword ?? ''}”?`}
        consequences={[
          'ลูกค้าจะไม่เห็น Keyword นี้ในรายงานอีก',
          ...(deleteTarget && deleteTarget.images.length > 0
            ? [`รูปหลักฐาน ${deleteTarget.images.length} รูปที่แนบไว้จะถูกลบไปด้วย`]
            : []),
          'ลบแล้วกู้คืนไม่ได้',
        ]}
        onConfirm={confirmDelete}
      />
    </Card>
  )
}
