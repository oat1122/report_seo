'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Sparkles, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TrafficChangeData } from '../lib/historyCalculations'

interface TrafficProgressBarProps {
  changeData: TrafficChangeData
}

type Trend = TrafficChangeData['trend']

const trendStyle: Record<Trend, { bar: string; text: string; Icon: typeof TrendingUp }> = {
  up: {
    bar: 'bg-gradient-to-r from-secondary to-secondary/80',
    text: 'text-success',
    Icon: TrendingUp,
  },
  down: {
    bar: 'bg-gradient-to-r from-destructive to-destructive/80',
    text: 'text-destructive',
    Icon: TrendingDown,
  },
  new: {
    bar: 'bg-gradient-to-r from-info to-info/80',
    text: 'text-info',
    Icon: Sparkles,
  },
  neutral: {
    bar: 'bg-gradient-to-r from-muted-foreground to-muted-foreground/80',
    text: 'text-muted-foreground',
    Icon: Minus,
  },
}

export const TrafficProgressBar: React.FC<TrafficProgressBarProps> = ({ changeData }) => {
  const { percentage, trend, hasHistory, currentValue } = changeData
  const { bar, text, Icon } = trendStyle[trend]

  const absPercentage = Math.abs(percentage)
  const basePercentage = Math.min(absPercentage, 100)
  const isOverflow = absPercentage > 100

  const displayText = (() => {
    if (trend === 'new') return 'New'
    if (!hasHistory) return '-'
    const sign = percentage >= 0 ? '+' : ''
    return `${sign}${absPercentage.toFixed(0)}%`
  })()

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-semibold">{currentValue.toLocaleString()}</span>

        {trend === 'new' ? (
          <Badge className="bg-info/10 text-info gap-1 text-xs font-semibold">
            <Sparkles className="size-3" />
            New
          </Badge>
        ) : (
          <span className={cn('flex items-center gap-1 text-xs font-semibold', text)}>
            <Icon className="size-3" />
            {displayText}
          </span>
        )}
      </div>

      <div className="bg-border relative h-2 overflow-visible rounded-full">
        <div
          className={cn('absolute inset-y-0 left-0 rounded-full transition-all', bar)}
          style={{ width: `${basePercentage}%` }}
        />

        {isOverflow && (
          <>
            <div className="from-warning via-warning/70 to-warning absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r opacity-70" />
            <div className="bg-warning absolute -top-0.5 -right-1 size-3 animate-pulse rounded-full shadow-[0_0_8px_color-mix(in_srgb,var(--warning)_60%,transparent)]" />
          </>
        )}
      </div>

      {isOverflow && (
        <p className="text-warning mt-1 text-right text-[0.65rem] font-bold">
          🏆 {absPercentage.toFixed(0)}% Growth!
        </p>
      )}
    </div>
  )
}
