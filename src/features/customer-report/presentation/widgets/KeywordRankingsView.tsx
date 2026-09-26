'use client'

import React, { useId, useMemo, useState } from 'react'
import { AlertCircle, ChevronDown, Search } from 'lucide-react'
import type { Variants } from 'motion/react'
import { AnimatePresence, EASE_OUT, motion } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useHistoryContext } from '../contexts/HistoryContext'
import { useReportFilters } from '../contexts/ReportFiltersContext'
import { ChartEmptyState } from '../components/ChartEmptyState'
import {
  computeBracketTransitions,
  computeKeywordRankings,
  type KeywordRankCard,
} from '../lib/historyCalculations'
import { BracketSummaryCards } from '../keywords/BracketSummaryCards'
import { KeywordRankTile } from '../keywords/KeywordRankTile'
import { KeywordRankRow } from '../keywords/KeywordRankRow'
import { RankFilterSegment } from '../keywords/RankFilterSegment'
import {
  RANK_SORTS,
  applyRankView,
  countByFilter,
  previousBracketCounts,
  type RankFilter,
  type RankSort,
} from '../keywords/keyword-view'

const INITIAL_VISIBLE = 8

const LIST_VARIANTS: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}
const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.36, ease: EASE_OUT } },
}
const ITEM_EXIT = { opacity: 0, scale: 0.96, transition: { duration: 0.18 } }

const RankList = ({
  cards,
  className,
  render,
}: {
  cards: KeywordRankCard[]
  className: string
  render: (card: KeywordRankCard) => React.ReactNode
}) => (
  <motion.ul initial="hidden" animate="show" variants={LIST_VARIANTS} className={className}>
    <AnimatePresence mode="popLayout">
      {cards.map((card) => (
        <motion.li
          key={card.id}
          layout
          variants={ITEM_VARIANTS}
          exit={ITEM_EXIT}
          className="min-w-0"
        >
          {render(card)}
        </motion.li>
      ))}
    </AnimatePresence>
  </motion.ul>
)

const LoadingState = () => (
  <div role="status" className="flex flex-col gap-5">
    <span className="sr-only">กำลังโหลดข้อมูล Keyword...</span>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-[124px] rounded-[20px]" />
      ))}
    </div>
    <Skeleton className="h-8 w-64 rounded-xl" />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-[196px] rounded-[18px]" />
      ))}
    </div>
  </div>
)

export const KeywordRankingsView = () => {
  const { keywordHistory, currentKeywords, isLoading, error } = useHistoryContext()
  const { period } = useReportFilters()
  const searchId = useId()
  const headingId = useId()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<RankFilter>('all')
  const [sort, setSort] = useState<RankSort>('position')
  const [showAll, setShowAll] = useState(false)

  const { cards, brackets, total } = useMemo(
    () => computeKeywordRankings(keywordHistory, currentKeywords, period),
    [keywordHistory, currentKeywords, period],
  )
  const previous = useMemo(
    () => previousBracketCounts(computeBracketTransitions(keywordHistory, currentKeywords, period)),
    [keywordHistory, currentKeywords, period],
  )
  const counts = useMemo(() => countByFilter(cards), [cards])
  const filtered = useMemo(
    () => applyRankView(cards, { filter, sort, query }),
    [cards, filter, sort, query],
  )

  if (isLoading) return <LoadingState />

  if (error && total === 0) {
    return (
      <div
        role="alert"
        className="bg-glass-card border-glass-border shadow-card flex flex-col items-start gap-3 rounded-[20px] border p-5 md:flex-row md:items-center md:p-6"
      >
        <AlertCircle className="text-danger-strong size-6 shrink-0" aria-hidden="true" />
        <div className="flex flex-1 flex-col gap-1">
          <p className="font-medium">โหลดข้อมูลอันดับ Keyword ไม่สำเร็จ</p>
          <p className="text-text-secondary text-[13px]">
            การเชื่อมต่อขัดข้องชั่วคราว ลองโหลดหน้านี้ใหม่อีกครั้ง ถ้ายังไม่ได้ให้แจ้งทีม SEO
            ที่ดูแลบัญชีของคุณ
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          โหลดใหม่
        </Button>
      </div>
    )
  }

  if (total === 0) {
    return <ChartEmptyState message="ยังไม่มี Keyword ในรายงานนี้" height="200px" />
  }

  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE)
  const clearFilters = () => {
    setQuery('')
    setFilter('all')
  }

  return (
    <div className="flex flex-col gap-5">
      <BracketSummaryCards brackets={brackets} total={total} previous={previous} period={period} />

      <section aria-labelledby={headingId} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-text-secondary hidden text-[11px] tracking-[0.14em] uppercase md:block">
              Keyword Rankings
            </span>
            <h2 id={headingId} className="text-lg font-semibold md:text-[19px]">
              ผลอันดับของแต่ละ Keyword
            </h2>
            <p className="text-text-secondary text-[13px]">
              ดูได้เลยว่าแต่ละคำติดอันดับที่เท่าไหร่ · เส้นขึ้น = อันดับดีขึ้น
            </p>
          </div>
          <div className="relative w-full md:w-[280px]">
            <label htmlFor={searchId} className="sr-only">
              ค้นหา keyword
            </label>
            <Search
              aria-hidden="true"
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            />
            <Input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหา keyword..."
              className="border-glass-border rounded-[14px] bg-white/75 pl-10 dark:bg-white/5"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <RankFilterSegment value={filter} counts={counts} onChange={setFilter} />
          <Select value={sort} onValueChange={(v) => setSort(v as RankSort)}>
            <SelectTrigger className="border-glass-border w-full bg-white/70 text-[13px] md:ml-auto md:w-auto md:data-[size=default]:h-10 dark:bg-white/5">
              <span className="text-text-secondary">เรียงตาม:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              {RANK_SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-glass-card border-glass-border flex flex-col items-center gap-3 rounded-[20px] border px-5 py-10 text-center">
            <Search className="text-muted-foreground size-6" aria-hidden="true" />
            <p className="text-sm">
              ไม่พบ keyword ที่ตรงกับตัวกรอง
              {query.trim() !== '' && <> “{query.trim()}”</>}
            </p>
            <Button variant="soft" size="sm" onClick={clearFilters}>
              ล้างตัวกรอง
            </Button>
          </div>
        ) : (
          <>
            <RankList
              cards={visible}
              className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              render={(card) => <KeywordRankTile card={card} />}
            />
            <RankList
              cards={visible}
              className="flex flex-col gap-2.5 md:hidden"
              render={(card) => <KeywordRankRow card={card} />}
            />
          </>
        )}

        {filtered.length > INITIAL_VISIBLE && (
          <button
            type="button"
            aria-expanded={showAll}
            onClick={() => setShowAll((v) => !v)}
            className="bg-info-subtle hover:bg-info-subtle/70 focus-visible:ring-ring/70 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-[14px] text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] md:h-10 md:w-auto md:self-center md:rounded-full md:px-[18px] md:text-[13px]"
          >
            {showAll ? 'แสดงน้อยลง' : `ดูทั้งหมด ${filtered.length} คำ`}
            <ChevronDown
              aria-hidden="true"
              className={cn('size-4 transition-transform', showAll && 'rotate-180')}
            />
          </button>
        )}
      </section>
    </div>
  )
}
