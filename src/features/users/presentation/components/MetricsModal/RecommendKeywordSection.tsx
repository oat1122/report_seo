import React from 'react'
import { Plus, Trash2, Pencil, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Field, FieldGroup } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { KdLevel, KD_LEVELS } from '@/types/kd'
import { KeywordRecommend, KeywordRecommendForm } from '@/types/metrics'

const NONE_KD = '__none__'

interface RecommendKeywordSectionProps {
  newRecommend: KeywordRecommendForm
  recommendKeywordsData: KeywordRecommend[]
  editingRecommendId: string | null
  onRecommendChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRecommendSelectChange: (value: KdLevel | '') => void
  onAddRecommend: () => void
  onSetEditingRecommend: (keyword: KeywordRecommend) => void
  onClearEditingRecommend: () => void
  onDeleteRecommendKeyword: (id: string) => void
}

export const RecommendKeywordSection: React.FC<RecommendKeywordSectionProps> = ({
  newRecommend,
  recommendKeywordsData,
  editingRecommendId,
  onRecommendChange,
  onRecommendSelectChange,
  onAddRecommend,
  onSetEditingRecommend,
  onClearEditingRecommend,
  onDeleteRecommendKeyword,
}) => (
  <div className="border-border rounded-2xl border p-4 sm:p-6">
    <div className="mb-4">
      <h3 className="text-lg font-bold">Keyword Recommend</h3>
      <p className="text-muted-foreground mt-1 text-sm">
        บันทึกคีย์เวิร์ดที่แนะนำให้ลูกค้า พร้อมระดับความยากและหมายเหตุสั้น ๆ
      </p>
    </div>

    <div
      className={cn(
        'border-border mb-4 rounded-xl border p-4',
        editingRecommendId ? 'bg-warning/10' : 'bg-muted/50',
      )}
    >
      <FieldGroup>
        {editingRecommendId && (
          <div className="border-info/30 bg-info/10 text-info rounded-md border px-3 py-2 text-sm">
            กำลังแก้ไข Keyword Recommend รายการเดิม สามารถปรับข้อมูลแล้วกดบันทึกการแก้ไขได้ทันที
          </div>
        )}

        <Field>
          <Label htmlFor="rec-keyword">Keyword</Label>
          <Input
            id="rec-keyword"
            name="keyword"
            placeholder="เช่น เสื้อ"
            value={newRecommend.keyword}
            onChange={onRecommendChange}
          />
        </Field>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field>
            <Label htmlFor="rec-kd">KD</Label>
            <Select
              value={newRecommend.kd ?? NONE_KD}
              onValueChange={(v) => onRecommendSelectChange(v === NONE_KD ? '' : (v as KdLevel))}
            >
              <SelectTrigger id="rec-kd">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_KD}>
                  <em>ไม่ระบุ</em>
                </SelectItem>
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
              id="rec-top"
              checked={newRecommend.isTopReport}
              onCheckedChange={(c) =>
                onRecommendChange({
                  target: {
                    name: 'isTopReport',
                    type: 'checkbox',
                    checked: c === true,
                    value: '',
                  },
                } as unknown as React.ChangeEvent<HTMLInputElement>)
              }
            />
            <Label htmlFor="rec-top" className="cursor-pointer">
              แสดงใน Top Report
            </Label>
          </div>
        </div>

        <Field>
          <Label htmlFor="rec-note">หมายเหตุ</Label>
          <Textarea
            id="rec-note"
            name="note"
            placeholder="เช่น ยากมาก"
            value={newRecommend.note || ''}
            onChange={onRecommendChange as unknown as React.ChangeEventHandler<HTMLTextAreaElement>}
            rows={3}
          />
        </Field>

        <div className="flex flex-col justify-end gap-2 sm:flex-row">
          {editingRecommendId && (
            <Button variant="ghost" onClick={onClearEditingRecommend}>
              ยกเลิก
            </Button>
          )}
          <Button
            onClick={onAddRecommend}
            disabled={!newRecommend.keyword.trim()}
            className="bg-warning text-warning-foreground hover:bg-warning/90"
          >
            {editingRecommendId ? <Save /> : <Plus />}
            {editingRecommendId ? 'บันทึกการแก้ไข' : 'เพิ่ม Keyword แนะนำ'}
          </Button>
        </div>
      </FieldGroup>
    </div>

    <div>
      <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <h4 className="font-bold">รายการ Keyword แนะนำ</h4>
        <Badge variant="outline" className="border-warning/40 text-warning">
          {recommendKeywordsData.length} รายการ
        </Badge>
      </div>

      {recommendKeywordsData.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-xl border p-6 text-center text-sm">
          ยังไม่มี Keyword ที่แนะนำ
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {recommendKeywordsData.map((kw) => (
            <li
              key={kw.id}
              className="border-border flex items-start justify-between gap-3 rounded-xl border p-4"
            >
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
                  KD: {kw.kd || 'ไม่ระบุ'}
                  {kw.note ? ` | หมายเหตุ: ${kw.note}` : ''}
                </p>
              </div>
              <div className="flex gap-0.5">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="แก้ไข"
                  onClick={() => onSetEditingRecommend(kw)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="ลบ"
                  onClick={() => onDeleteRecommendKeyword(kw.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
)
