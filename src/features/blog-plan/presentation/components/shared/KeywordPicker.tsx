'use client'

import { useMemo, useState } from 'react'
import { Check, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ArticleKeywordInput } from '../../../schemas'
import type { CustomerKeywordOption } from '../../../domain/BlogArticle'

interface KeywordPickerProps {
  options: CustomerKeywordOption[]
  isLoading?: boolean
  selected: ArticleKeywordInput[]
  onChange: (next: ArticleKeywordInput[]) => void
}

export function KeywordPicker({ options, isLoading, selected, onChange }: KeywordPickerProps) {
  const [search, setSearch] = useState('')

  const selectedKeys = useMemo(
    () => new Set(selected.map((item) => item.keyword.toLowerCase())),
    [selected],
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return options
    return options.filter((option) => option.keyword.toLowerCase().includes(term))
  }, [options, search])

  const toggle = (option: CustomerKeywordOption) => {
    const key = option.keyword.toLowerCase()
    if (selectedKeys.has(key)) {
      onChange(selected.filter((item) => item.keyword.toLowerCase() !== key))
      return
    }
    onChange([
      ...selected,
      { keyword: option.keyword, source: option.source, sourceId: option.sourceId },
    ])
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ค้นหา keyword ของลูกค้า"
          className="pl-8"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-sm">ไม่พบ keyword</p>
      ) : (
        <ul className="border-border max-h-64 overflow-y-auto rounded-md border">
          {filtered.map((option) => {
            const isSelected = selectedKeys.has(option.keyword.toLowerCase())
            return (
              <li key={`${option.source}-${option.sourceId}`}>
                <button
                  type="button"
                  onClick={() => toggle(option)}
                  className={cn(
                    'hover:bg-muted/60 flex w-full items-center gap-2 px-3 py-2 text-left text-sm',
                    isSelected && 'bg-secondary/15',
                  )}
                >
                  <Check
                    className={cn(
                      'size-4 shrink-0',
                      isSelected ? 'text-secondary-foreground' : 'opacity-0',
                    )}
                  />
                  <span className="flex-1 truncate">{option.keyword}</span>

                  {option.usedCount > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-warning/10 text-warning border-warning/30 shrink-0 text-[10px]"
                    >
                      เขียนแล้ว {option.usedCount}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-muted-foreground shrink-0 text-[10px]">
                    {option.source === 'REPORT' ? `อันดับ ${option.position ?? '—'}` : 'แนะนำ'}
                  </Badge>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <Badge key={item.keyword} variant="outline" className="bg-secondary/20">
              {item.keyword}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
