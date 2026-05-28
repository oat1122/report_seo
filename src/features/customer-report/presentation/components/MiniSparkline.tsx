'use client'

import { useId, useMemo } from 'react'

interface MiniSparklineProps {
  data: number[]
  /** CSS color string (token or rgb) — passed to stroke + fill */
  color: string
  width?: number
  height?: number
  /** lower-is-better (เช่น position) — flip path ขึ้นเมื่อค่าลด */
  invert?: boolean
  ariaLabel?: string
}

/**
 * Pure SVG sparkline — เบามาก ไม่ใช้ chart lib
 * รับ data: number[] (≥1 จุด), render เป็น polyline + filled area
 */
export const MiniSparkline = ({
  data,
  color,
  width = 96,
  height = 28,
  invert = false,
  ariaLabel,
}: MiniSparklineProps) => {
  const gradientId = useId()

  const { points, areaPath } = useMemo(() => {
    if (data.length === 0) return { points: '', areaPath: '' }

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const padding = 2
    const innerWidth = width - padding * 2
    const innerHeight = height - padding * 2

    const xStep = data.length > 1 ? innerWidth / (data.length - 1) : 0
    const coords = data.map((v, i) => {
      const x = padding + i * xStep
      const normalized = (v - min) / range // 0..1, higher is up visually
      // SVG y axis flipped — value สูง = y น้อย
      // invert=true (lower-is-better): ค่าน้อย → ขึ้นสูง
      const yNormalized = invert ? normalized : 1 - normalized
      const y = padding + yNormalized * innerHeight
      return { x, y }
    })

    const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ')
    const area =
      `M ${coords[0].x},${height - padding} ` +
      coords.map((c) => `L ${c.x},${c.y}`).join(' ') +
      ` L ${coords[coords.length - 1].x},${height - padding} Z`

    return { points: linePoints, areaPath: area }
  }, [data, width, height, invert])

  if (data.length === 0) {
    return (
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel ?? 'Sparkline (no data)'}
        className="text-muted-foreground"
      >
        <line
          x1={2}
          y1={height / 2}
          x2={width - 2}
          y2={height / 2}
          stroke="currentColor"
          strokeDasharray="2 2"
          opacity={0.3}
        />
      </svg>
    )
  }

  return (
    <svg
      width={width}
      height={height}
      role="img"
      aria-label={ariaLabel ?? `Sparkline ${data.length} points`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
