import { cn } from '@/lib/utils'
import type { KeywordRankCard } from '../lib/historyCalculations'
import { KeywordEvidenceDialog } from '../components/KeywordEvidenceDialog'
import { DeltaPill } from './DeltaPill'
import { KdBadge } from './KdBadge'
import { BRACKET_STYLE } from './keyword-view'
import { formatNumber } from '../lib/formatters'

// แถวราย keyword บนมือถือ (< md) — แทนการ์ด/ตาราง ไม่ให้เกิด scroll แนวนอนที่ 390px
export const KeywordRankRow = ({ card }: { card: KeywordRankCard }) => {
  const bracket = BRACKET_STYLE[card.bucket]

  return (
    <article className="bg-glass-card border-glass-border shadow-card grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border py-3 pr-3.5 pl-3 backdrop-blur-[14px]">
      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl leading-none font-semibold tabular-nums">
          {card.currentPosition !== null ? `#${card.currentPosition}` : '—'}
        </span>
        <span aria-hidden="true" className={cn('h-[5px] w-[22px] rounded-full', bracket.fill)} />
        <span className="sr-only">{bracket.label}</span>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="truncate text-[15px] font-medium" title={card.keyword}>
          {card.keyword}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <DeltaPill card={card} />
          <KdBadge kd={card.kd} />
        </div>
        <p className="text-text-secondary text-xs tabular-nums">
          Traffic {formatNumber(card.traffic)}/เดือน
        </p>
      </div>

      <KeywordEvidenceDialog
        keyword={card.keyword}
        images={card.images}
        className="h-11 min-w-11 rounded-xl"
      />
    </article>
  )
}
