import { KeywordReportHistory } from '@/types/history'

// ============================================================
// Internal helpers ที่ใช้ร่วมกันข้าม module ของ historyCalculations
// (สิ่งที่เคย duplicate inline หลายจุดในไฟล์เดิม)
// ============================================================

/** Comparator: เรียงเก่า → ใหม่ ตาม dateRecorded */
export const sortByDateAsc = <T extends { dateRecorded: string | Date }>(a: T, b: T): number =>
  new Date(a.dateRecorded).getTime() - new Date(b.dateRecorded).getTime()

/** Comparator: เรียงใหม่ → เก่า ตาม dateRecorded */
export const sortByDateDesc = <T extends { dateRecorded: string | Date }>(a: T, b: T): number =>
  new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime()

/** Clamp ค่าให้อยู่ในช่วง [min, max] */
export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

/** position ที่เป็นอันดับจริง (ไม่ใช่ null / sentinel 0,ติดลบ ที่แปลว่า unranked) */
export const isRanked = (position: number | null | undefined): position is number =>
  position != null && position > 0

/** Format วันที่แบบ chart label (Thai locale) เช่น "26 พ.ย." */
export const formatThaiDate = (date: Date | string): string =>
  new Date(date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })

/**
 * คืนค่า metric จาก history record ที่ใกล้เคียง daysAgo มากที่สุด (ก่อนหรือเท่ากับ)
 * @param history sorted desc (recent first) — รูปแบบของ useGetCombinedHistory
 */
export const getValueAtOrBefore = <T extends { dateRecorded: string | Date }>(
  history: T[],
  daysAgo: number,
  pick: (r: T) => number,
): number | null => {
  if (history.length === 0) return null
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysAgo)
  const cutoffMs = cutoff.getTime()
  // history desc — หา record แรกที่ dateRecorded <= cutoff
  for (const record of history) {
    if (new Date(record.dateRecorded).getTime() <= cutoffMs) {
      return pick(record)
    }
  }
  return null
}

/**
 * หา historical record ล่าสุดที่ ≤ cutoff สำหรับแต่ละ keyword
 * @param keywordHistory ต้อง sorted desc (recent first) — record แรกที่เจอต่อ keyword คือ snapshot ล่าสุดก่อน cutoff
 * @param keywordFilter ถ้าระบุ จะนับเฉพาะ keyword ใน set นี้
 */
export const latestRecordByKeywordBeforeCutoff = (
  keywordHistory: KeywordReportHistory[],
  cutoffMs: number,
  keywordFilter?: Set<string>,
): Map<string, KeywordReportHistory> => {
  const map = new Map<string, KeywordReportHistory>()
  for (const rec of keywordHistory) {
    if (new Date(rec.dateRecorded).getTime() > cutoffMs) continue
    if (keywordFilter && !keywordFilter.has(rec.keyword)) continue
    if (!map.has(rec.keyword)) map.set(rec.keyword, rec)
  }
  return map
}

// ---- Week bucketing (ISO week, Monday start) ----

export const WEEK_MS = 7 * 24 * 60 * 60 * 1000

/** Reset to Monday 00:00 (ISO week) */
export const toWeekStart = (d: Date): Date => {
  const result = new Date(d)
  result.setHours(0, 0, 0, 0)
  const day = result.getDay() // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day // shift to Monday
  result.setDate(result.getDate() + diff)
  return result
}

/**
 * สร้าง bucket ของ N สัปดาห์ล่าสุด (เก่า → ใหม่) พร้อม label
 * ใช้ร่วมกันระหว่าง AI overview weekly counts + keyword heatmap
 */
export const buildWeekStarts = (
  weeks: number,
  now: Date,
): Array<{ start: Date; label: string }> => {
  const latestWeekStart = toWeekStart(now)
  const earliestWeekStart = new Date(latestWeekStart.getTime() - (weeks - 1) * WEEK_MS)
  const result: Array<{ start: Date; label: string }> = []
  for (let i = 0; i < weeks; i += 1) {
    const start = new Date(earliestWeekStart.getTime() + i * WEEK_MS)
    result.push({ start, label: formatThaiDate(start) })
  }
  return result
}
