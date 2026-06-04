import { OverallMetricsHistory } from '@/types/history'
import { formatThaiDate } from './_shared'

// ============================================================================
// Traffic Forecast Cone — linear regression + std error confidence band
// ============================================================================

export interface ForecastPoint {
  /** Day offset from "now": 0 = today, negative = past, positive = forecast */
  dayOffset: number
  /** ms epoch */
  time: number
  label: string
  /** Actual traffic (null for forecast) */
  actual: number | null
  /** Predicted traffic (null for actual) */
  predicted: number | null
  /** Lower bound of confidence interval (null for actual) */
  lower: number | null
  /** Upper bound of confidence interval (null for actual) */
  upper: number | null
}

export interface TrafficForecastResult {
  points: ForecastPoint[]
  /** Predicted traffic at +daysAhead */
  forecastEnd: number | null
  /** % change predicted vs current */
  changePct: number | null
  /** R² of fit (0..1) — null เมื่อไม่มีความหมาย (จุดจริง < 3 หรือค่าคงที่ ssTot=0) */
  rSquared: number | null
  hasData: boolean
}

const DAY_MS = 1000 * 60 * 60 * 24

/**
 * Forecast traffic for N days ahead using linear regression on history.
 * Confidence band = ±1.96 × residual std (~95% CI).
 */
export const computeTrafficForecast = (
  metricsHistory: OverallMetricsHistory[],
  daysAhead: number = 30,
): TrafficForecastResult => {
  // metricsHistory ผ่าน visibility filter (ติ๊กใน History) มาแล้วจาก HistoryContext
  // และมี synthetic "current" snapshot (id='current', dateRecorded=now) prepend อยู่หัวแถวจาก
  // getCustomerHistoryReport → ใช้เป็น source เดียวพอ (anchor = จุด history ล่าสุด = synthetic current)
  // ⚠️ ห้ามรับค่า live (currentTraffic) จากภายนอกมายัดเป็นจุด — จะข้าม visibility path (rule 11)
  const nowMs = Date.now()

  // รวมจุดต่อวัน (กัน edit ซ้ำในวันเดียว + กัน synthetic current ชนกับ history วันเดียวกัน)
  const byDay = new Map<string, { t: number; y: number }>()
  for (const h of metricsHistory) {
    if (h.organicTraffic == null) continue
    const t = new Date(h.dateRecorded).getTime()
    const dayKey = new Date(h.dateRecorded).toISOString().split('T')[0]
    const existing = byDay.get(dayKey)
    if (!existing || t > existing.t) byDay.set(dayKey, { t, y: Number(h.organicTraffic) })
  }

  const historyPoints = Array.from(byDay.values()).sort((a, b) => a.t - b.t)

  if (historyPoints.length < 2) {
    return { points: [], forecastEnd: null, changePct: null, rSquared: null, hasData: false }
  }

  // Normalize time to days from first point
  const t0 = historyPoints[0].t
  const xs = historyPoints.map((p) => (p.t - t0) / DAY_MS)
  const ys = historyPoints.map((p) => p.y)
  const n = xs.length

  const meanX = xs.reduce((s, v) => s + v, 0) / n
  const meanY = ys.reduce((s, v) => s + v, 0) / n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i += 1) {
    num += (xs[i] - meanX) * (ys[i] - meanY)
    den += (xs[i] - meanX) ** 2
  }
  const slope = den === 0 ? 0 : num / den
  const intercept = meanY - slope * meanX

  // Residual std
  let ssRes = 0
  let ssTot = 0
  for (let i = 0; i < n; i += 1) {
    const pred = slope * xs[i] + intercept
    ssRes += (ys[i] - pred) ** 2
    ssTot += (ys[i] - meanY) ** 2
  }
  const residualStd = Math.sqrt(ssRes / Math.max(n - 2, 1))
  const ci = 1.96 * residualStd
  // R² มีความหมายเมื่อ n ≥ 3 และข้อมูลมี variance จริง:
  // n = 2 → เส้นลากผ่าน 2 จุดพอดี R²=1 เสมอ (หลอกตา); ssTot = 0 → ค่าคงที่ ไม่มีแนวโน้ม
  const rSquared = n < 3 || ssTot === 0 ? null : Math.max(0, 1 - ssRes / ssTot)

  // Build series: keep last 30 history points (or all if fewer) + forecast
  const historyTail = historyPoints.slice(-30)
  const points: ForecastPoint[] = historyTail.map((p) => ({
    dayOffset: Math.round((p.t - nowMs) / DAY_MS),
    time: p.t,
    label: formatThaiDate(new Date(p.t)),
    actual: p.y,
    predicted: null,
    lower: null,
    upper: null,
  }))

  // Anchor: forecast starts from the "today" prediction (continuous with history end)
  for (let d = 1; d <= daysAhead; d += 1) {
    const future = nowMs + d * DAY_MS
    const x = (future - t0) / DAY_MS
    const pred = Math.max(0, slope * x + intercept)
    points.push({
      dayOffset: d,
      time: future,
      label: formatThaiDate(new Date(future)),
      actual: null,
      predicted: pred,
      lower: Math.max(0, pred - ci),
      upper: pred + ci,
    })
  }

  // Bridge: add a "now" predicted point so forecast line is continuous from last actual
  if (points.length > 0) {
    const lastActualIdx = points.findIndex((p) => p.predicted !== null)
    if (lastActualIdx > 0) {
      const lastActual = points[lastActualIdx - 1]
      if (lastActual.actual !== null) {
        lastActual.predicted = lastActual.actual
        lastActual.lower = lastActual.actual
        lastActual.upper = lastActual.actual
      }
    }
  }

  const forecastEnd = points[points.length - 1]?.predicted ?? null
  // anchor "ปัจจุบัน" = จุด history ล่าสุด (= synthetic current จาก visibility path)
  const anchorCurrent = historyPoints[historyPoints.length - 1].y
  const changePct =
    forecastEnd != null && anchorCurrent > 0
      ? ((forecastEnd - anchorCurrent) / anchorCurrent) * 100
      : null

  return { points, forecastEnd, changePct, rSquared, hasData: true }
}
