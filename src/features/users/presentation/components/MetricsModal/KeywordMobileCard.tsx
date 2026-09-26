'use client'

import React from 'react'
import { History, ImageIcon, Pencil, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EASE_OUT, motion } from '@/components/motion'
import { cn } from '@/lib/utils'
import type { KdLevel } from '@/types/kd'
import type { KeywordReport, KeywordReportForm } from '@/types/metrics'
import { KeywordEvidenceManager } from '@/features/keywords/presentation/components/KeywordEvidenceManager'
import { MAX_KEYWORD_EVIDENCE_IMAGES } from '@/features/keywords/schemas'
import { KdBadge } from './KdBadge'
import { checkboxChangeEvent, formatPosition } from './domainFormat'
import { KD_META, KD_OPTIONS } from './kdMeta'

interface KeywordMobileCardProps {
  customerId: string
  keyword: KeywordReport
  isEditing: boolean
  evidenceOpen: boolean
  draft: KeywordReportForm
  editError: boolean
  editInputRef: React.RefObject<HTMLInputElement | null>
  onDraftChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDraftKdChange: (value: KdLevel) => void
  onEditKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onSave: () => void
  onCancel: () => void
  onToggleEvidence: () => void
  onEdit: () => void
  onDelete: () => void
  onViewHistory: () => void
}

/** แถว Keyword Report บนจอแคบ (rule 6) — ดู/แก้ไขในการ์ดเดียวกัน · ปุ่มสูง 44 */
export function KeywordMobileCard({
  customerId,
  keyword: kw,
  isEditing,
  evidenceOpen,
  draft,
  editError,
  editInputRef,
  onDraftChange,
  onDraftKdChange,
  onEditKeyDown,
  onSave,
  onCancel,
  onToggleEvidence,
  onEdit,
  onDelete,
  onViewHistory,
}: KeywordMobileCardProps) {
  const idBase = `kw-m-${kw.id}`

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: EASE_OUT }}
      className={cn(
        'border-glass-border flex flex-col gap-3 rounded-2xl border p-4',
        isEditing ? 'bg-info-subtle' : 'bg-glass-tile',
      )}
    >
      {isEditing ? (
        <>
          <Field className="gap-1.5">
            <Label htmlFor={`${idBase}-keyword`}>Keyword</Label>
            <Input
              ref={editInputRef}
              id={`${idBase}-keyword`}
              name="keyword"
              value={draft.keyword}
              onChange={onDraftChange}
              onKeyDown={onEditKeyDown}
              aria-invalid={editError}
              aria-describedby={editError ? `${idBase}-error` : undefined}
            />
            {editError && (
              <p id={`${idBase}-error`} role="alert" className="text-danger-strong text-xs">
                กรอก Keyword ก่อนบันทึก
              </p>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field className="gap-1.5">
              <Label htmlFor={`${idBase}-position`}>
                Position
                <span className="text-text-secondary font-normal">
                  (เดิม {formatPosition(kw.position)})
                </span>
              </Label>
              <Input
                id={`${idBase}-position`}
                name="position"
                type="number"
                inputMode="numeric"
                min={0}
                value={draft.position ?? ''}
                onChange={onDraftChange}
                onKeyDown={onEditKeyDown}
                className="text-right tabular-nums"
              />
            </Field>
            <Field className="gap-1.5">
              <Label htmlFor={`${idBase}-traffic`}>Traffic</Label>
              <Input
                id={`${idBase}-traffic`}
                name="traffic"
                type="number"
                inputMode="numeric"
                min={0}
                value={draft.traffic}
                onChange={onDraftChange}
                onKeyDown={onEditKeyDown}
                className="text-right tabular-nums"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 items-end gap-3">
            <Field className="gap-1.5">
              <Label htmlFor={`${idBase}-kd`}>KD</Label>
              <Select value={draft.kd} onValueChange={(v) => onDraftKdChange(v as KdLevel)}>
                <SelectTrigger id={`${idBase}-kd`} className="w-full">
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
            </Field>
            <label
              htmlFor={`${idBase}-top`}
              className="flex h-11 cursor-pointer items-center gap-2.5 text-sm"
            >
              <Checkbox
                id={`${idBase}-top`}
                checked={draft.isTopReport}
                onCheckedChange={(c) =>
                  onDraftChange(checkboxChangeEvent('isTopReport', c === true))
                }
              />
              Top Report
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="outline" onClick={onCancel}>
              ยกเลิก
            </Button>
            <Button onClick={onSave}>บันทึก</Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-medium break-words">{kw.keyword}</span>
              {kw.isTopReport && (
                <span className="text-text-secondary inline-flex items-center gap-1 text-xs">
                  <Star aria-hidden className="fill-warning-accent text-warning-text size-3.5" />
                  แสดงใน Top Report
                </span>
              )}
            </div>
            <KdBadge kd={kw.kd} />
          </div>
          <dl className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/60 px-3 py-2 dark:bg-white/5">
              <dt className="text-text-secondary text-xs">Position</dt>
              <dd className="font-semibold tabular-nums">{formatPosition(kw.position)}</dd>
            </div>
            <div className="rounded-xl bg-white/60 px-3 py-2 dark:bg-white/5">
              <dt className="text-text-secondary text-xs">Traffic</dt>
              <dd className="font-semibold tabular-nums">
                {Number(kw.traffic).toLocaleString('en-US')}
              </dd>
            </div>
          </dl>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="min-w-0 flex-1"
              onClick={onToggleEvidence}
              aria-expanded={evidenceOpen}
              aria-controls={`${idBase}-evidence`}
            >
              <ImageIcon />
              หลักฐาน {kw.images.length}/{MAX_KEYWORD_EVIDENCE_IMAGES}
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={`ดูประวัติ ${kw.keyword}`}
              onClick={onViewHistory}
            >
              <History />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={`แก้ไข ${kw.keyword}`}
              onClick={onEdit}
            >
              <Pencil />
            </Button>
            <Button
              variant="destructive-subtle"
              size="icon"
              aria-label={`ลบ ${kw.keyword}`}
              onClick={onDelete}
            >
              <Trash2 />
            </Button>
          </div>
          {evidenceOpen && (
            <div id={`${idBase}-evidence`}>
              <KeywordEvidenceManager
                customerId={customerId}
                keywordId={kw.id}
                images={kw.images}
              />
            </div>
          )}
        </>
      )}
    </motion.li>
  )
}
