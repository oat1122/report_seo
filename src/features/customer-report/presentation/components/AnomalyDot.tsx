'use client'

import type { DotProps } from 'recharts'

// recharts ส่ง prop `payload` มาให้ custom dot แต่ไม่ได้ประกาศใน DotProps — augment เอง
interface AnomalyDotProps extends DotProps {
  payload?: Record<string, unknown>
  /** dataKey ของ value column — อ่าน flag จาก payload[`${dataKey}__anomaly`] */
  dataKey: string
  /** key ใน payload สำหรับ anomaly flag (override default) */
  anomalyKey?: string
}

// Custom dot สำหรับ recharts <Line dot={<AnomalyDot dataKey="organicTraffic" />} />
// ถ้า payload มี flag true → render ring สี --warning ทับจุด
export const AnomalyDot = (props: AnomalyDotProps) => {
  const { cx, cy, payload, stroke, dataKey, anomalyKey } = props
  if (cx == null || cy == null) return null
  const flagKey = anomalyKey ?? `${dataKey}__anomaly`
  const isAnomaly = Boolean(payload?.[flagKey])
  if (isAnomaly) {
    return <circle cx={cx} cy={cy} r={5} fill={stroke} stroke="var(--warning)" strokeWidth={2} />
  }
  return <circle cx={cx} cy={cy} r={3} fill={stroke} />
}
