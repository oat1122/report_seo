import React from 'react'
import { Plus, Trash2, Pencil, History, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Field, FieldGroup } from '@/components/ui/field'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { KdLevel, KD_LEVELS } from '@/types/kd'
import { KeywordReport, KeywordReportForm } from '@/types/metrics'
import { KeywordEvidenceManager } from '@/features/keywords/presentation/components/KeywordEvidenceManager'

interface KeywordReportSectionProps {
  customerId: string
  newKeyword: KeywordReportForm
  keywordsData: KeywordReport[]
  editingKeywordId: string | null
  onKeywordChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeywordSelectChange: (value: KdLevel) => void
  onAddOrUpdateKeyword: () => void
  onDeleteKeyword: (id: string) => void
  onSetEditing: (keyword: KeywordReport) => void
  onClearEditing: () => void
  onViewHistory: (keyword: KeywordReport) => void
}

export const KeywordReportSection: React.FC<KeywordReportSectionProps> = ({
  customerId,
  newKeyword,
  keywordsData,
  editingKeywordId,
  onKeywordChange,
  onKeywordSelectChange,
  onAddOrUpdateKeyword,
  onDeleteKeyword,
  onSetEditing,
  onClearEditing,
  onViewHistory,
}) => (
  <div className="border-border rounded-2xl border p-4 sm:p-6">
    <div className="mb-4">
      <h3 className="text-lg font-bold">Keyword Report</h3>
      <p className="text-muted-foreground mt-1 text-sm">
        เพิ่มคีย์เวิร์ดหลักที่ต้องการติดตาม พร้อมอันดับ ทราฟฟิก และระดับความยาก
      </p>
    </div>

    <div
      className={cn(
        'border-border mb-4 rounded-xl border p-4',
        editingKeywordId ? 'bg-warning/10' : 'bg-muted/50',
      )}
    >
      <FieldGroup>
        {editingKeywordId && (
          <div className="border-info/30 bg-info/10 text-info rounded-md border px-3 py-2 text-sm">
            กำลังแก้ไขคีย์เวิร์ดรายการเดิม สามารถปรับข้อมูลแล้วกดบันทึกการแก้ไขได้ทันที
          </div>
        )}

        <Field>
          <Label htmlFor="kw-keyword">Keyword</Label>
          <Input
            id="kw-keyword"
            name="keyword"
            placeholder="เช่น รับทำ SEO สายขาว"
            value={newKeyword.keyword}
            onChange={onKeywordChange}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Field>
            <Label htmlFor="kw-position">Position</Label>
            <Input
              id="kw-position"
              name="position"
              type="number"
              min={0}
              value={newKeyword.position ?? ''}
              onChange={onKeywordChange}
            />
          </Field>
          <Field>
            <Label htmlFor="kw-traffic">Traffic</Label>
            <Input
              id="kw-traffic"
              name="traffic"
              type="number"
              min={0}
              value={newKeyword.traffic}
              onChange={onKeywordChange}
            />
          </Field>
          <Field>
            <Label htmlFor="kw-kd">KD</Label>
            <Select
              value={newKeyword.kd}
              onValueChange={(v) => onKeywordSelectChange(v as KdLevel)}
            >
              <SelectTrigger id="kw-kd">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KD_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="border-border flex items-center gap-2 rounded-md border border-dashed px-3">
            <Checkbox
              id="kw-top"
              checked={newKeyword.isTopReport}
              onCheckedChange={(c) =>
                onKeywordChange({
                  target: {
                    name: 'isTopReport',
                    type: 'checkbox',
                    checked: c === true,
                    value: '',
                  },
                } as unknown as React.ChangeEvent<HTMLInputElement>)
              }
            />
            <Label htmlFor="kw-top" className="cursor-pointer">
              Top Report
            </Label>
          </div>
        </div>

        <div className="flex flex-col justify-end gap-2 sm:flex-row">
          {editingKeywordId && (
            <Button variant="ghost" onClick={onClearEditing}>
              ยกเลิก
            </Button>
          )}
          <Button
            onClick={onAddOrUpdateKeyword}
            disabled={!newKeyword.keyword.trim()}
            className={cn(
              editingKeywordId
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                : '',
            )}
          >
            {editingKeywordId ? <Save /> : <Plus />}
            {editingKeywordId ? 'บันทึกการแก้ไข' : 'เพิ่ม Keyword'}
          </Button>
        </div>
      </FieldGroup>
    </div>

    <div>
      <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <h4 className="font-bold">รายการคีย์เวิร์ดที่บันทึกแล้ว</h4>
        <Badge variant="outline" className="border-secondary/40 text-secondary-foreground">
          {keywordsData.length} รายการ
        </Badge>
      </div>

      {keywordsData.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-xl border p-6 text-center text-sm">
          ยังไม่มีข้อมูลคีย์เวิร์ดในรายงาน
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {keywordsData.map((kw) => (
            <li key={kw.id} className="border-border flex flex-col rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{kw.keyword}</span>
                    {kw.isTopReport && (
                      <Badge variant="outline" className="border-warning/40 text-warning">
                        Top Report
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Position: {kw.position ?? '-'} | Traffic: {kw.traffic} | KD: {kw.kd}
                  </p>
                </div>
                <div className="flex gap-0.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label="ดูประวัติ"
                        onClick={() => onViewHistory(kw)}
                      >
                        <History className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>ดูประวัติ</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label="แก้ไข"
                        onClick={() => onSetEditing(kw)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>แก้ไข</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label="ลบ"
                        onClick={() => onDeleteKeyword(kw.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>ลบ</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <KeywordEvidenceManager
                customerId={customerId}
                keywordId={kw.id}
                images={kw.images}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
)
