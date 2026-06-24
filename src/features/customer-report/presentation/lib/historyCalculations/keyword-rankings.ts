import type { KeywordReportHistory } from '@/types/history'
import type { CurrentKeyword } from '@/hooks/api/useCustomersApi'
import type { PeriodOption } from '../chartConfig'
import { isRanked, localDayKey, sortByDateAsc } from './_shared'
import { bucketForPosition, type PositionBucket } from './distribution'

// ============================================================
// Keyword Rankings — per-keyword "ranking ตอนนี้เท่าไหร่" view
// แหล่งข้อมูลเดียว: keywordHistory + currentKeywords (now-point) ตาม rule 11
// ใช้ join ด้วย reportId === keyword.id (ทนกว่าการ match ด้วยชื่อ — ชื่อซ้ำได้)
// ============================================================

// clamp อันดับสุดโต่ง (เช่น #350) ก่อนเข้าฉาก sparkline — ไม่งั้นจุดเดียวกดเส้นที่เหลือแบนหมด
const POSITION_SPARK_CLIP = 100

export type RankedBucket = Exclude<PositionBucket, 'unranked'>

export interface KeywordRankCard {
  id: string
  keyword: string
  /** อันดับปัจจุบัน (ranked เท่านั้น) — null = ยังไม่ติดอันดับ */
  currentPosition: number | null
  bucket: PositionBucket
  /** prev - current; บวก = อันดับดีขึ้น, ลบ = แย่ลง, 0 = คงที่, null = เทียบไม่ได้ */
  delta: number | null
  /** ติดอันดับแล้วแต่มีข้อมูลรอบเดียว (ยังไม่มีตัวเทียบ) */
  isNew: boolean
  /** positions สำหรับ sparkline (ranked + clamped, เก่า → ใหม่) — ส่งเข้า MiniSparkline แบบ invert */
  positionSeries: number[]
  hasTrend: boolean
  traffic: number
  kd: string
  /** รูปหลักฐานอันดับ (จาก currentKeywords — single source ตาม rule 11) */
  images: CurrentKeyword['images']
}

export interface BracketSummaryItem {
  bucket: RankedBucket
  count: number
  pct: number // 0..100 จากจำนวน keyword ทั้งหมด
}

export interface KeywordRankingsResult {
  cards: KeywordRankCard[]
  brackets: BracketSummaryItem[]
  total: number
}

const RANKED_BUCKETS: RankedBucket[] = ['top3', 'top10', 'top20', 'beyond']

/**
 * สร้าง view-model ของ "ranking รายคำ" — การ์ด + สรุป bracket
 * @param keywordHistory ผ่าน isVisible filter จาก HistoryContext แล้ว
 * @param currentKeywords ค่าปัจจุบัน (authoritative "now")
 * @param period ช่วงเวลาที่เลือก — กรอง window ของ sparkline/delta
 */
export const computeKeywordRankings = (
  keywordHistory: KeywordReportHistory[],
  currentKeywords: CurrentKeyword[],
  period: PeriodOption,
): KeywordRankingsResult => {
  const cutoffMs = Date.now() - period * 24 * 60 * 60 * 1000
  const todayKey = localDayKey(new Date())

  const cards: KeywordRankCard[] = currentKeywords.map((kw) => {
    // history ของ keyword นี้ใน window, เฉพาะ ranked, เรียงเก่า → ใหม่
    // ตัดรอบที่เป็น "วันนี้" ทิ้ง — ใช้ currentKeywords เป็น now-point ที่ถูกต้องกว่า
    const past = keywordHistory
      .filter((h) => h.reportId === kw.id)
      .filter((h) => new Date(h.dateRecorded).getTime() >= cutoffMs)
      .filter((h) => isRanked(h.position) && localDayKey(h.dateRecorded) !== todayKey)
      .sort(sortByDateAsc)
      .map((h) => h.position as number)

    // narrow ผ่าน local const (number | null) + เช็ค !== null — narrow ได้ทุกเวอร์ชัน TS
    // (ต่างจากเก็บผล type-guard ไว้ใน boolean แล้วใช้กับ property → บาง TS ไม่ narrow)
    const currentPosition = isRanked(kw.position) ? kw.position : null

    const rawSeries = currentPosition !== null ? [...past, currentPosition] : past
    const positionSeries = rawSeries.map((p) => Math.min(p, POSITION_SPARK_CLIP))

    let delta: number | null = null
    let isNew = false
    if (currentPosition !== null) {
      if (past.length >= 1) delta = past[past.length - 1] - currentPosition
      else isNew = true
    }

    return {
      id: kw.id,
      keyword: kw.keyword,
      currentPosition,
      bucket: bucketForPosition(currentPosition),
      delta,
      isNew,
      positionSeries,
      hasTrend: positionSeries.length >= 2,
      traffic: kw.traffic,
      kd: kw.kd,
      images: kw.images,
    }
  })

  // เรียงอันดับดีสุดก่อน, ยังไม่ติดอันดับไปท้ายสุด
  cards.sort(
    (a, b) =>
      (a.currentPosition ?? Number.POSITIVE_INFINITY) -
      (b.currentPosition ?? Number.POSITIVE_INFINITY),
  )

  const total = cards.length
  const brackets: BracketSummaryItem[] = RANKED_BUCKETS.map((bucket) => {
    const count = cards.filter((c) => c.bucket === bucket).length
    return { bucket, count, pct: total === 0 ? 0 : Math.round((count / total) * 100) }
  })

  return { cards, brackets, total }
}
