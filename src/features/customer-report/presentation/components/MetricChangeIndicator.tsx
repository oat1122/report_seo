'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TrafficChangeData } from '../lib/historyCalculations'
import { DeltaChip } from './DeltaChip'

interface MetricChangeIndicatorProps {
  icon: React.ReactNode
  label: string
  value: string | number
  changeData: TrafficChangeData
  // hex string — backward-compat for OverallMetricsCard (Phase 6 will replace with iconClassName)
  color?: string
  iconClassName?: string
}

// Tile ตัวเลข domain (Traffic / Keywords / Backlinks / Ref. Domains) + % เปลี่ยนแปลง
export const MetricChangeIndicator: React.FC<MetricChangeIndicatorProps> = ({
  icon,
  label,
  value,
  changeData,
  color,
  iconClassName,
}) => {
  const { percentage, trend, hasHistory } = changeData
  const pctText = `${Math.abs(percentage).toFixed(1)}%`

  return (
    <div className="bg-glass-tile border-glass-border flex h-full flex-col gap-1.5 rounded-2xl border px-3.5 py-3">
      <span className="text-text-secondary flex items-center gap-1.5 text-xs">
        <span
          aria-hidden
          className={cn('flex [&_svg]:size-4', iconClassName)}
          style={color ? { color } : undefined}
        >
          {icon}
        </span>
        {label}
      </span>
      <span className="text-xl leading-tight font-semibold tabular-nums">{value}</span>
      <span className="mt-auto self-start">
        {trend === 'new' ? (
          <Badge variant="info" className="gap-1 font-semibold">
            <Sparkles aria-hidden />
            ข้อมูลใหม่
          </Badge>
        ) : !hasHistory ? (
          <span className="text-text-secondary text-xs">ยังไม่มีข้อมูลให้เทียบ</span>
        ) : trend === 'neutral' ? (
          <DeltaChip direction="flat" tone="neutral">
            0%
          </DeltaChip>
        ) : (
          <DeltaChip direction={trend} tone={trend === 'up' ? 'good' : 'bad'}>
            {pctText}
          </DeltaChip>
        )}
      </span>
    </div>
  )
}
