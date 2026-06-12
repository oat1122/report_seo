import { OverallMetricsHistory } from '@/types/history'

// ============================================================================
// Intraday Traffic — เส้นโค้ง "เป้าหมายรายชั่วโมงของวันนี้" แบบ fake (seed ต่อวัน)
// แยก 2 ชุด:
//   • actualByHour (จำนวนจริง)  — รูป spiky ของพฤติกรรมมนุษย์
//   • forecastByHour (คาดการณ์) — รูปคาดหวังที่เรียบกว่า (ต่างจาก actual ทุกจุด)
// ฟังก์ชันนี้ pure 100% (seed ด้วย dayKey ที่ส่งเข้ามา — ไม่อ่าน Date ภายใน ดู rule 7)
// ตรรกะ "ตอนนี้/live" (partial ชั่วโมงปัจจุบัน) อยู่ที่ฝั่ง widget — ที่นี่ให้แค่เป้าหมายเต็มของวัน
// ผลรวม actual ทั้งวัน = organicTraffic ปัจจุบัน (synthetic current ที่ผ่าน visibility filter — rule 11)
//   ⚠️ ห้ามรับค่า live (currentTraffic) จากภายนอก — anchor มาจาก metricsHistory เท่านั้น
// ============================================================================

export interface IntradayTrafficResult {
  /** จำนวนจริงเต็มของแต่ละชั่วโมง (index 0..23) */
  actualByHour: number[]
  /** คาดการณ์ของแต่ละชั่วโมง (index 0..23) */
  forecastByHour: number[]
  /** ผลรวมจำนวนจริงทั้งวัน = organicTraffic ปัจจุบัน */
  total: number
  /** ชั่วโมงที่เข้าชมจริงสูงสุด (0..23) */
  peakHour: number
  hasData: boolean
}

/**
 * น้ำหนักฐานต่อชั่วโมง (รูปทรง diurnal ของมนุษย์) — ค่าเชิงสัมพัทธ์ ไม่ใช่จำนวนจริง
 * ต่ำสุดช่วงตี 2–4, ไต่ขึ้นเช้า, พีคสาย ~10 น. และค่ำ ~20 น.
 */
const BASE_HOURLY_WEIGHTS = [
  0.3, 0.2, 0.14, 0.1, 0.1, 0.14, 0.28, 0.55, 0.85, 1.1, 1.25, 1.2, 1.05, 1.1, 1.15, 1.1, 1.0, 0.95,
  1.05, 1.2, 1.3, 1.05, 0.7, 0.45,
]

/** FNV-1a → uint32 seed (deterministic จาก string) */
const hashSeed = (str: string): number => {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** mulberry32 PRNG — คืน generator ที่ deterministic ต่อ seed (กัน flicker ตอน re-render) */
const mulberry32 = (seed: number): (() => number) => {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * แจกจำนวนเต็ม `total` ลง 24 ช่องตามน้ำหนัก ด้วย largest-remainder
 * → ผลรวมเท่ากับ total พอดีเสมอ (ไม่ปัดเศษหาย)
 */
const distributeToInts = (weights: number[], total: number): number[] => {
  const sumW = weights.reduce((s, w) => s + w, 0)
  if (sumW <= 0) return weights.map(() => 0)
  const raw = weights.map((w) => (w / sumW) * total)
  const counts = raw.map((v) => Math.floor(v))
  const used = counts.reduce((s, v) => s + v, 0)
  let remaining = total - used
  const byFracDesc = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac)
  let k = 0
  while (remaining > 0 && byFracDesc.length > 0) {
    counts[byFracDesc[k % byFracDesc.length].i] += 1
    remaining -= 1
    k += 1
  }
  return counts
}

/**
 * สร้างเป้าหมายการเข้าชมรายชั่วโมงของ "วันนี้" — แยกจำนวนจริง vs คาดการณ์
 * @param metricsHistory จาก useHistoryContext() (sorted desc, [0] = synthetic current ที่ผ่าน visibility filter)
 * @param dayKey คีย์ของวัน (เช่น "2026-06-12") ใช้ seed — รูปทรงต่างกันทุกวัน แต่คงที่ทั้งวัน
 */
export const computeIntradayTraffic = (
  metricsHistory: OverallMetricsHistory[],
  dayKey: string,
): IntradayTrafficResult => {
  const current = metricsHistory[0]
  const total = current?.organicTraffic != null ? Math.round(Number(current.organicTraffic)) : 0

  if (!current || total <= 0) {
    return { actualByHour: [], forecastByHour: [], total: 0, peakHour: 0, hasData: false }
  }

  // seed ต่อ (customer + วัน) → รูปทรงต่างกันทุกวัน แต่คงที่ทั้งวัน
  const prng = mulberry32(hashSeed(`${current.customerId}:${dayKey}`))

  // --- จำนวนจริง: รูป spiky (jitter แรง + อารมณ์ของวัน + spike สุ่ม) ---
  const actualWeights = BASE_HOURLY_WEIGHTS.map((base) => base * (0.65 + prng() * 0.7))
  const morningBias = 0.85 + prng() * 0.45
  const eveningBias = 0.85 + prng() * 0.45
  for (let h = 8; h <= 12; h += 1) actualWeights[h] *= morningBias
  for (let h = 18; h <= 22; h += 1) actualWeights[h] *= eveningBias
  for (let s = 0; s < 2; s += 1) {
    const hh = Math.floor(prng() * 24)
    actualWeights[hh] *= 1.25 + prng() * 0.75
  }
  const actualByHour = distributeToInts(actualWeights, total)

  // --- คาดการณ์: เส้นคาดหวังที่เรียบกว่า (jitter เบา, ไม่มี spike) จาก draw ชุดใหม่ ---
  // → ต่างจาก actual ทุกจุด แต่ y-range ใกล้กัน (scale ไป total เหมือนกัน)
  const forecastWeights = BASE_HOURLY_WEIGHTS.map((base) => base * (0.9 + prng() * 0.2))
  const forecastByHour = distributeToInts(forecastWeights, total)

  let peakHour = 0
  for (let h = 1; h < 24; h += 1) {
    if (actualByHour[h] > actualByHour[peakHour]) peakHour = h
  }

  return { actualByHour, forecastByHour, total, peakHour, hasData: true }
}
