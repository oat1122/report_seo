'use client'

import React from 'react'
import { AnimatedNumber } from '@/components/motion'
import { SemiGauge } from './SemiGauge'

interface GaugeChartProps {
  label: string
  value: number
  /** ความกว้าง gauge (px) */
  size?: number
  /** สี arc — CSS var() string */
  color: string
  /** ป้ายการเปลี่ยนแปลงใต้ gauge (ไม่บังคับ) */
  delta?: React.ReactNode
}

// Tile คะแนน 0–100: ชื่อ + gauge 180° + ตัวเลข "/ 100" + delta
export const GaugeChart: React.FC<GaugeChartProps> = ({
  label,
  value,
  size = 116,
  color,
  delta,
}) => (
  <div className="bg-glass-tile border-glass-border flex h-full flex-col items-center gap-2 rounded-2xl border px-3 py-3.5">
    <p className="text-[13px] font-medium">{label}</p>
    <div className="shrink-0" style={{ width: size }}>
      <SemiGauge value={value} color={color} strokeWidth={9}>
        <AnimatedNumber value={value} className="text-[26px] font-semibold tabular-nums" />
        <span className="text-text-secondary text-[11px]">/ 100</span>
      </SemiGauge>
    </div>
    {delta}
  </div>
)
