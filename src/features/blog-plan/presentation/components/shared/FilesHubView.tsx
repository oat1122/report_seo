'use client'

import { useMemo, useState } from 'react'
import { Download, Eye, FileText, ImageIcon, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { formatShortDate } from '@/lib/date'
import { BlogPlanPageShell } from './BlogPlanPageShell'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { FilePreviewDialog, formatFileSize, getPreviewKind } from './FilePreviewDialog'
import {
  collectAllFiles,
  EMPTY_FILE_FILTERS,
  FILE_FILTER_ALL,
  filterFiles,
  formatMonthLabel,
  toMonthKey,
  type AllFileEntry,
  type FileFilters,
} from './blog-plan-view'
import {
  BLOG_ARTICLE_STATUS_LABELS,
  getClientStageLabel,
  getStageLabel,
} from '../../../domain/policies/article-status'
import { BLOG_STAGES } from '../../../domain/policies/stage-schedule'
import type { BlogArticle, BlogArticleFile, BlogFileKind } from '../../../domain/BlogArticle'

const KIND_LABELS: Record<BlogFileKind, string> = {
  ARTICLE_DOC: 'ไฟล์บทความ',
  COVER_IMAGE: 'ภาพประกอบ',
}

/** คอลัมน์เดียวกันทั้งหัวตารางและแถว — จอเล็กยุบเป็นการ์ดซ้อนบรรทัด */
const ROW_GRID =
  'md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)_minmax(0,1.2fr)_6.5rem_4.5rem_8.5rem] md:items-center md:gap-4'

interface FilesHubViewProps {
  articles: BlogArticle[]
  canManage: boolean
  isPending?: boolean
  onBack: () => void
  onDeleteFile: (articleId: string, fileId: string) => void
}

/** คลังไฟล์ — ไฟล์ทุกบทความทุกเดือนของลูกค้ารายนี้ในตารางเดียว กรองได้หลายแกน */
export function FilesHubView({
  articles,
  canManage,
  isPending,
  onBack,
  onDeleteFile,
}: FilesHubViewProps) {
  const [filters, setFilters] = useState<FileFilters>(EMPTY_FILE_FILTERS)
  const [previewFile, setPreviewFile] = useState<BlogArticleFile | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AllFileEntry | null>(null)

  const allFiles = useMemo(() => collectAllFiles(articles), [articles])
  const files = useMemo(() => filterFiles(allFiles, filters), [allFiles, filters])

  // ตัวเลือกเดือนสร้างจากบทความจริง — เดือนที่ไม่มีบทความไม่ต้องโผล่ให้เลือก
  const monthOptions = useMemo(() => {
    const seen = new Map<string, { year: number; month: number }>()
    articles.forEach((article) => {
      seen.set(toMonthKey(article.targetYear, article.targetMonth), {
        year: article.targetYear,
        month: article.targetMonth,
      })
    })
    return [...seen.entries()].sort(([a], [b]) => b.localeCompare(a))
  }, [articles])

  const stageLabel = canManage ? getStageLabel : getClientStageLabel
  const isFiltered = files.length !== allFiles.length

  return (
    <BlogPlanPageShell
      title="คลังไฟล์"
      description="ไฟล์ทุกบทความทุกเดือนของลูกค้ารายนี้รวมไว้ที่เดียว กรองหาแล้วดาวน์โหลดได้ทันที"
      wide
      onBack={onBack}
    >
      <Card className="gap-4 px-4 py-4 sm:px-5 sm:py-5">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search
              aria-hidden
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            />
            <Input
              className="h-11 rounded-[12px] pl-9"
              placeholder="ค้นหาชื่อไฟล์ / ชื่อบทความ"
              aria-label="ค้นหาชื่อไฟล์หรือชื่อบทความ"
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            />
          </div>

          <FilterSelect
            label="ชนิดไฟล์"
            allLabel="ทุกชนิด"
            value={filters.kind}
            onChange={(kind) => setFilters({ ...filters, kind })}
            options={Object.entries(KIND_LABELS)}
          />

          <FilterSelect
            label="ขั้นตอน"
            allLabel="ทุกขั้นตอน"
            value={filters.stageCode}
            onChange={(stageCode) => setFilters({ ...filters, stageCode })}
            options={BLOG_STAGES.map((stage) => [
              stage.code,
              canManage ? stage.label : stage.clientLabel,
            ])}
          />

          <FilterSelect
            label="เดือน"
            allLabel="ทุกเดือน"
            value={filters.month}
            onChange={(month) => setFilters({ ...filters, month })}
            options={monthOptions.map(([key, { year, month }]) => [
              key,
              formatMonthLabel(year, month),
            ])}
          />

          <FilterSelect
            label="บทความ"
            allLabel="ทุกบทความ"
            value={filters.articleId}
            onChange={(articleId) => setFilters({ ...filters, articleId })}
            options={articles.map((article) => [article.id, article.title])}
          />

          <FilterSelect
            label="สถานะบทความ"
            allLabel="ทุกสถานะ"
            value={filters.status}
            onChange={(status) => setFilters({ ...filters, status })}
            options={Object.entries(BLOG_ARTICLE_STATUS_LABELS)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-info-subtle text-foreground rounded-full px-3 py-1 text-xs font-medium tabular-nums">
            แสดง {files.length} จาก {allFiles.length} ไฟล์
          </span>
          {isFiltered && (
            <Button
              variant="ghost"
              className="h-11 rounded-[10px] px-3 text-[13px] sm:h-8"
              onClick={() => setFilters(EMPTY_FILE_FILTERS)}
            >
              ล้างตัวกรอง
            </Button>
          )}
        </div>

        {files.length === 0 ? (
          <p className="text-text-secondary border-border rounded-2xl border border-dashed bg-white/40 px-6 py-10 text-center text-sm dark:bg-white/5">
            {allFiles.length === 0
              ? 'ยังไม่มีไฟล์ — ไฟล์บทความและภาพประกอบจะมาโผล่ที่นี่เมื่อทีมส่งงาน'
              : 'ไม่มีไฟล์ที่ตรงกับตัวกรองนี้ ลองล้างตัวกรองดูนะครับ'}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <div
              aria-hidden
              className={cn(
                'text-text-secondary border-border hidden border-b px-3 pb-2.5 text-xs font-medium',
                ROW_GRID,
              )}
            >
              <span>ไฟล์</span>
              <span>บทความ</span>
              <span>ขั้นตอน</span>
              <span>วันที่ส่ง</span>
              <span className="text-right">ขนาด</span>
              <span />
            </div>

            <ul className="flex flex-col gap-2">
              {files.map((row) => (
                <li
                  key={row.id}
                  className={cn(
                    'bg-glass-tile border-glass-border flex flex-col gap-3 rounded-2xl border p-3.5 md:rounded-[14px] md:px-3 md:py-2.5',
                    ROW_GRID,
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <FileKindIcon kind={getPreviewKind(row)} />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{row.filename}</span>
                      <span className="text-text-secondary truncate text-xs">
                        {KIND_LABELS[row.kind]} · เวอร์ชัน {row.version} ·{' '}
                        {row.uploadedByName ?? 'ทีมเขียน'}
                      </span>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm">{row.articleTitle}</span>
                    <span className="text-text-secondary truncate text-xs">
                      {formatMonthLabel(row.targetYear, row.targetMonth)} ·{' '}
                      {BLOG_ARTICLE_STATUS_LABELS[row.articleStatus]}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm">{stageLabel(row.stageCode)}</span>
                    <span className="text-text-secondary text-xs">
                      {row.round === null ? 'ไฟล์เดิม' : `รอบ ${row.round}`}
                    </span>
                  </div>

                  <div className="text-text-secondary flex items-center justify-between gap-3 text-xs md:contents md:text-sm">
                    <span className="md:text-foreground whitespace-nowrap">
                      <span className="md:hidden">ส่งเมื่อ </span>
                      {formatShortDate(row.createdAt)}
                    </span>
                    <span className="whitespace-nowrap tabular-nums md:text-right">
                      {formatFileSize(row.sizeBytes)}
                    </span>
                  </div>

                  <div className="flex gap-1.5 md:justify-end">
                    {getPreviewKind(row) !== 'none' && (
                      <Button
                        variant="outline"
                        className="size-11 rounded-[10px] p-0 md:size-9"
                        title="อ่านในหน้านี้"
                        aria-label={`อ่าน ${row.filename}`}
                        onClick={() => setPreviewFile(row)}
                      >
                        <Eye className="size-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="size-11 rounded-[10px] p-0 md:size-9"
                      asChild
                    >
                      <a
                        href={row.url}
                        download
                        title="ดาวน์โหลด"
                        aria-label={`ดาวน์โหลด ${row.filename}`}
                      >
                        <Download className="size-4" />
                      </a>
                    </Button>
                    {canManage && (
                      <Button
                        variant="ghost"
                        className="text-danger-strong hover:bg-danger-subtle hover:text-danger-strong size-11 rounded-[10px] p-0 md:size-9"
                        disabled={isPending}
                        title="ลบไฟล์"
                        aria-label={`ลบ ${row.filename}`}
                        onClick={() => setDeleteTarget(row)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <FilePreviewDialog
        file={previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
      />

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`ลบไฟล์ “${deleteTarget?.filename ?? ''}” ?`}
        consequences={[
          `ไฟล์นี้ของบทความ “${deleteTarget?.articleTitle ?? ''}” จะถูกลบออกจากระบบ`,
          'ทั้งทีมและลูกค้าจะดาวน์โหลดไฟล์เวอร์ชันนี้ไม่ได้อีก',
          'ลบแล้วกู้คืนไม่ได้',
        ]}
        confirmLabel="ลบไฟล์"
        onConfirm={() => {
          if (deleteTarget) onDeleteFile(deleteTarget.articleId, deleteTarget.id)
          setDeleteTarget(null)
        }}
      />
    </BlogPlanPageShell>
  )
}

function FileKindIcon({ kind }: { kind: ReturnType<typeof getPreviewKind> }) {
  const Icon = kind === 'image' ? ImageIcon : FileText

  return (
    <span
      aria-hidden
      className="bg-info-subtle text-info-strong flex size-9 shrink-0 items-center justify-center rounded-[10px]"
    >
      <Icon className="size-4" />
    </span>
  )
}

/** ตัวกรอง 1 ช่อง — ทุกช่องหน้าตาเหมือนกันหมด ต่างแค่รายการตัวเลือก */
function FilterSelect({
  label,
  allLabel,
  value,
  options,
  onChange,
}: {
  label: string
  allLabel: string
  value: string
  /** [value, label] — ห้ามมี value ว่าง เพราะ shadcn Select ไม่รับ */
  options: [string, string][]
  onChange: (value: string) => void
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-11 w-full rounded-[12px]" aria-label={label}>
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={FILE_FILTER_ALL}>{allLabel}</SelectItem>
        {options.map(([optionValue, optionLabel]) => (
          <SelectItem key={optionValue} value={optionValue}>
            {optionLabel}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
