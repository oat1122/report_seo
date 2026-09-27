import { Badge } from '@/components/ui/badge'
import type { KeywordRankCard } from '../lib/historyCalculations'
import { MiniSparkline } from '../components/MiniSparkline'
import { KeywordEvidenceDialog } from '../components/KeywordEvidenceDialog'
import { DeltaPill } from './DeltaPill'
import { KdBadge } from './KdBadge'
import { BRACKET_STYLE } from './keyword-view'
import { formatNumber } from '../lib/formatters'

// การ์ดราย keyword (md ขึ้นไป) — อันดับใหญ่ + delta + sparkline + traffic/KD
export const KeywordRankTile = ({ card }: { card: KeywordRankCard }) => {
  const bracket = BRACKET_STYLE[card.bucket]

  return (
    <article className="bg-glass-card border-glass-border shadow-card flex h-full flex-col gap-3 rounded-[18px] border p-4 backdrop-blur-[14px]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 className="truncate text-[15px] font-medium" title={card.keyword}>
            {card.keyword}
          </h3>
          <Badge variant="outline" className="border-transparent bg-white/90 dark:bg-white/10">
            <span data-dot className={bracket.fill} />
            {bracket.label}
          </Badge>
        </div>
        <KeywordEvidenceDialog keyword={card.keyword} images={card.images} />
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-[34px] leading-none font-semibold tabular-nums">
            {card.currentPosition !== null ? `#${card.currentPosition}` : '—'}
          </span>
          <DeltaPill card={card} />
        </div>
        {card.hasTrend ? (
          <MiniSparkline
            data={card.positionSeries}
            color="var(--chart-1)"
            invert
            width={92}
            height={40}
            className="shrink-0"
            ariaLabel={`แนวโน้มอันดับของ ${card.keyword} (เส้นขึ้น = อันดับดีขึ้น)`}
          />
        ) : (
          <span className="text-text-secondary max-w-[112px] text-right text-xs leading-snug">
            {card.positionSeries.length === 0
              ? 'ยังไม่ติดอันดับในช่วงนี้'
              : 'มีข้อมูลรอบเดียว — ยังไม่มีเส้นแนวโน้ม'}
          </span>
        )}
      </div>

      <dl className="border-border/70 mt-auto grid grid-cols-2 gap-2 border-t pt-2.5">
        <div className="flex flex-col gap-0.5">
          <dt className="text-text-secondary text-[11px]">Traffic / เดือน</dt>
          <dd className="text-sm font-semibold tabular-nums">{formatNumber(card.traffic)}</dd>
        </div>
        <div className="flex flex-col items-start gap-0.5">
          <dt className="text-text-secondary text-[11px]">ความยาก (KD)</dt>
          <dd>
            <KdBadge kd={card.kd} />
          </dd>
        </div>
      </dl>
    </article>
  )
}
