'use client'

import type { DotProps } from 'recharts'

interface ClippedDotProps extends DotProps {
  payload?: Record<string, unknown>
  /** keyword identifier ใช้ build payload key `posReal_${keyword}` + `pos_${keyword}` */
  keyword: string
}

// Position dot ที่ visualize clipping — ถ้าค่าจริง > POSITION_CLIP_THRESHOLD
// (`posReal_*` ≠ `pos_*`) → render dot opacity ต่ำ + radius ใหญ่กว่า (badge feel)
export const ClippedDot = (props: ClippedDotProps) => {
  const { cx, cy, payload, stroke, keyword } = props
  if (cx == null || cy == null) return null
  const real = payload?.[`posReal_${keyword}`] as number | null | undefined
  const clipped = payload?.[`pos_${keyword}`] as number | null | undefined
  const isClipped = real != null && clipped != null && real !== clipped
  return (
    <circle
      cx={cx}
      cy={cy}
      r={isClipped ? 5 : 3}
      fill={stroke}
      stroke={stroke}
      strokeWidth={isClipped ? 1.5 : 0}
      opacity={isClipped ? 0.55 : 1}
    />
  )
}
