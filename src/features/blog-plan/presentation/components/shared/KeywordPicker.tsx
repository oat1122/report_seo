'use client'

import { useId, useMemo, useState } from 'react'
import { Check, Search, X } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ArticleKeywordInput } from '../../../schemas'
import type { CustomerKeywordOption } from '../../../domain/BlogArticle'

interface KeywordPickerProps {
  options: CustomerKeywordOption[]
  isLoading?: boolean
  selected: ArticleKeywordInput[]
  onChange: (next: ArticleKeywordInput[]) => void
  /** id ของช่องค้นหา — ให้ <Label htmlFor> ชี้มาที่ช่องนี้ได้ */
  inputId?: string
}

/** ช่องเลือก keyword แบบ chip — ที่เลือกแล้วอยู่ในช่อง, รายการจาก Keyword Report อยู่ใต้ช่อง */
export function KeywordPicker({
  options,
  isLoading,
  selected,
  onChange,
  inputId,
}: KeywordPickerProps) {
  const [search, setSearch] = useState('')
  const listId = useId()

  const selectedKeys = useMemo(
    () => new Set(selected.map((item) => item.keyword.toLowerCase())),
    [selected],
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return options
    return options.filter((option) => option.keyword.toLowerCase().includes(term))
  }, [options, search])

  const remove = (keyword: string) => {
    const key = keyword.toLowerCase()
    onChange(selected.filter((item) => item.keyword.toLowerCase() !== key))
  }

  const toggle = (option: CustomerKeywordOption) => {
    if (selectedKeys.has(option.keyword.toLowerCase())) {
      remove(option.keyword)
      return
    }
    onChange([
      ...selected,
      { keyword: option.keyword, source: option.source, sourceId: option.sourceId },
    ])
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="border-border focus-within:border-info focus-within:ring-info/25 flex min-h-11 flex-wrap items-center gap-1.5 rounded-[12px] border bg-white px-2.5 py-1.5 transition-shadow focus-within:ring-[3px] dark:bg-white/5">
        <Search aria-hidden className="text-muted-foreground size-4 shrink-0" />
        {selected.map((item) => (
          <span
            key={item.keyword}
            className="bg-info-subtle text-foreground inline-flex h-[30px] items-center gap-1 rounded-full pr-1 pl-2.5 text-[13px] font-medium"
          >
            {item.keyword}
            <button
              type="button"
              aria-label={`เอา ${item.keyword} ออก`}
              onClick={() => remove(item.keyword)}
              className="text-text-secondary hover:text-foreground focus-visible:ring-ring/60 flex size-6 items-center justify-center rounded-full transition-colors hover:bg-white/80 focus-visible:ring-2 focus-visible:outline-none dark:hover:bg-white/10"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        <input
          id={inputId}
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={selected.length > 0 ? 'ค้นหาเพิ่ม' : 'ค้นหา keyword ของลูกค้า'}
          aria-controls={listId}
          className="placeholder:text-muted-foreground h-[30px] min-w-24 flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-1.5" aria-busy="true" aria-label="กำลังโหลด keyword">
          <Skeleton className="h-10 w-full rounded-[10px]" />
          <Skeleton className="h-10 w-full rounded-[10px]" />
          <Skeleton className="h-10 w-full rounded-[10px]" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-text-secondary border-border rounded-[14px] border border-dashed py-4 text-center text-sm">
          {options.length === 0
            ? 'ยังไม่มี keyword ของลูกค้ารายนี้ให้เลือก'
            : 'ไม่พบ keyword ที่ตรงกับคำค้น'}
        </p>
      ) : (
        <ul
          id={listId}
          aria-label="Keyword จาก Keyword Report"
          className="border-border shadow-popover dark:bg-popover flex max-h-64 flex-col gap-0.5 overflow-y-auto rounded-[14px] border bg-white p-1.5"
        >
          {filtered.map((option) => {
            const isSelected = selectedKeys.has(option.keyword.toLowerCase())
            return (
              <li key={`${option.source}-${option.sourceId}`}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggle(option)}
                  className={cn(
                    'focus-visible:ring-ring/60 flex min-h-11 w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none',
                    isSelected ? 'bg-info-subtle' : 'hover:bg-muted',
                  )}
                >
                  <Check
                    aria-hidden
                    className={cn('text-info-strong size-4 shrink-0', !isSelected && 'opacity-0')}
                  />
                  <span className="flex-1 truncate">{option.keyword}</span>

                  {option.usedCount > 0 && (
                    <span className="bg-warning-subtle text-warning-text shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium">
                      เขียนแล้ว {option.usedCount}
                    </span>
                  )}
                  <span className="text-text-secondary shrink-0 text-xs">
                    {option.source === 'REPORT'
                      ? `อันดับ ${option.position ?? '—'}`
                      : `Keyword แนะนำ${option.kd ? ` · ${option.kd}` : ''}`}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
