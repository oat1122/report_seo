# CHART_CALC_AUDIT — Audit การคำนวณเบื้องหลังกราฟ/widget หน้า `/customer/report`

> ขอบเขต: `src/app/customer/report/page.tsx` → `src/features/customer-report/` ทั้ง slice
> (use case → HistoryContext → historyCalculations 8 โมดูล → widgets/components/tabs)
> วิธีตรวจ: เปิดไฟล์จริงทุกไฟล์ + trace ด้วยตัวเลขตัวอย่าง — **ไม่มีการแก้โค้ดใด ๆ**
> ข้อเท็จจริงฐาน (ยืนยันจากโค้ดแล้ว):
> - history ทั้งสองชุดมาจาก DB เรียง **desc** (`PrismaMetricsRepository.ts:46`, `PrismaKeywordRepository.ts:69`)
> - `getCustomerHistoryReport` prepend **synthetic current** (`id: 'current'`, `dateRecorded: new Date()`) เฉพาะ `metricsHistory` (`getCustomerHistoryReport.ts:22-41`) — `keywordHistory` ไม่มี synthetic
> - schema อนุญาต `position: 0` (`src/schemas/keyword.ts:6` — `min(0).nullable()`) → **sentinel 0 = unranked มีจริงใน DB** (สอดคล้อง commit `ccd79a9` ที่แก้ heatmap ไปแล้ว)
> - `HistoryContext` filter `isVisible` ที่เดียว (client) ทุก role (`HistoryContext.tsx:31-32`)

---

## 1. สรุปผู้บริหาร

| Severity | จำนวน | สรุป |
|---|---|---|
| **Critical** | 1 (✅ แก้แล้ว) | %change ทั้ง 4 ตัวใน Overall Domain Metrics **เป็น 0 เสมอ** (เทียบกับ synthetic current = ตัวเอง) — **แก้แล้ว 2026-06-10** |
| **High** | 4 (✅ แก้แล้ว) | sentinel `position = 0` ถูกตีความเป็น "อันดับ 0" ใน 3 จุดคำนวณ (Top-3 KPI, Top Movers/ROI, Velocity) + KPI "Total Keywords" เทียบข้ามแหล่งข้อมูลคนละความหมาย — **แก้แล้ว 2026-06-10** |
| **Medium** | 7 (✅ แก้แล้ว) | dedupe ด้วย UTC day ใน timezone ไทย, anomaly z-score เป็นไปไม่ได้เชิงคณิตศาสตร์เมื่อจุด < 8, CI forecast ไม่ขยายตาม horizon, "อัปเดตล่าสุด" โกหกตลอดกาล, sparkline plot position 0, anomaly โดน zero-padding, Avg Position หลอกว่า "ดีขึ้น" เมื่อหลุดอันดับหมด |
| **Low** | 10 (✅ แก้แล้ว) | display/consistency (เครื่องหมายลบหาย, เส้น "วันนี้" คลาด 1 วัน, second source ขัด rule 11, ขยาย period เงียบ ๆ ฯลฯ) — **แก้แล้ว 2026-06-10** |

bug ที่กระทบความเชื่อมั่นลูกค้ามากที่สุดคือ **C1** (การ์ด metrics หลักโชว์ +0.0% ตลอด ไม่ว่าค่าจะโตแค่ไหน) และกลุ่ม **H2/H3** (keyword ที่ "เพิ่งติดอันดับ" ถูกนับเป็น "หล่นลง" และ keyword ที่ "หลุดอันดับ" ถูกนับเป็น "ขยับขึ้น" — กลับด้านพอดี)

---

## 2. ตารางสรุป

| # | ไฟล์:บรรทัด | Widget/กราฟที่กระทบ | อาการ | Severity |
|---|---|---|---|---|
| ~~C1~~ ✅ | `lib/historyCalculations/trends.ts:78-90` + `OverallMetricsCard.tsx:46-57` | Overall Domain Metrics (4 การ์ด: Traffic/Keywords/Backlink/Ref.Domains) | previous = synthetic current = ค่าเดียวกับ current → **+0.0% เสมอ** | ~~Critical~~ **แก้แล้ว** |
| ~~H1~~ ✅ | `lib/historyCalculations/kpis.ts:44-45,109-110` | Quick Overview → "Top 3 Rankings" | `position ≤ 0` (unranked) ถูกนับเป็น Top 3 | ~~High~~ **แก้แล้ว** |
| ~~H2~~ ✅ | `lib/historyCalculations/distribution.ts:71-84` | Top Movers, Hero Status Card, ROI headline | position 0 เป็น baseline/ปลายทาง → gainer/loser **กลับด้าน** | ~~High~~ **แก้แล้ว** |
| ~~H3~~ ✅ | `lib/historyCalculations/keyword-performance.ts:137-153` | Keyword Velocity Scatter | posDelta คำนวณกับ sentinel 0 → quadrant ผิด | ~~High~~ **แก้แล้ว** |
| ~~H4~~ ✅ | `lib/historyCalculations/kpis.ts:77-79,113` | Quick Overview → "Total Keywords" | current = จำนวน keyword ที่ track, previous/sparkline = `organicKeywords` ของทั้งโดเมน → delta ไร้ความหมาย | ~~High~~ **แก้แล้ว** |
| ~~M1~~ ✅ | `lib/historyCalculations/forecast.ts:52-59` | Traffic Forecast Cone | dedupe รายวันด้วย **UTC** day ใน TZ ไทย → จุด "วันนี้" ซ้ำ 2 จุด / จุดเมื่อวานหาย → slope เพี้ยน | ~~Medium~~ **แก้แล้ว** |
| ~~M2~~ ✅ | `KeywordTrendChart.tsx:221-228` | แนวโน้ม Keyword (เส้น position/traffic) | แทนที่ history "วันนี้" ด้วยค่า current โดยใช้ UTC dayKey → record ช่วง 00:00–06:59 น. ไม่ถูกแทน → จุดซ้ำ | ~~Medium~~ **แก้แล้ว** |
| ~~M3~~ ✅ | `lib/historyCalculations/charts.ts:70-77` | SpamScore Timeline, Domain Metrics Trend, Keyword Trend (วงแหวน outlier) | z-score แบบ population std มี max = √(n−1) → **n < 8 จุด flag ไม่ได้เลย** ทั้งที่ UI เคลม "z > 2.5" | ~~Medium~~ **แก้แล้ว** |
| ~~M4~~ ✅ | `KeywordTrendChart.tsx:256-263` | แนวโน้ม Keyword (วงแหวน outlier traffic) | จุดที่ keyword ไม่มี record ถูกแทนด้วย 0 ก่อนคำนวณ z → mean/std เพี้ยนเมื่อเลือกหลาย keyword | ~~Medium~~ **แก้แล้ว** |
| ~~M5~~ ✅ | `lib/historyCalculations/forecast.ts:92-93,121-123` | Traffic Forecast Cone | CI กว้างคงที่ ±1.96·s ไม่ขยายตามระยะพยากรณ์ แต่เคลม "~95%" | ~~Medium~~ **แก้แล้ว** |
| ~~M6~~ ✅ | `lib/historyCalculations/kpis.ts:183-192` + `CoverageSnapshotCard.tsx:55` | Coverage Snapshot ("อัปเดต …ที่แล้ว") | `lastUpdated` = dateRecorded ของ synthetic current = เวลา fetch → **"ไม่กี่นาทีที่แล้ว" เสมอ** | ~~Medium~~ **แก้แล้ว** |
| ~~M7~~ ✅ | `lib/historyCalculations/charts.ts:144-149` + `kpis.ts:114` | Top Keywords Snapshot (sparkline), Quick Overview → Avg Position | sparkline plot position 0 เป็น "ดีสุด"; currentAvg null → 0 → badge "ดีขึ้น" ทั้งที่หลุดอันดับหมด | ~~Medium~~ **แก้แล้ว** |
| ~~L1~~ ✅ | `MetricChangeIndicator.tsx:42-44`, `TrafficProgressBar.tsx:48-51` | การ์ด metrics + ตาราง keyword | ค่าติดลบแสดงโดยตัดเครื่องหมายลบ (−12.3% → "12.3%") ต่างจาก Hero ที่แสดงเครื่องหมายครบ | ~~Low~~ **แก้แล้ว** |
| ~~L2~~ ✅ | `TrafficForecastCone.tsx:113-114` | Traffic Forecast Cone | เส้นอ้างอิง "วันนี้" ปักที่จุดพยากรณ์ d=+1 (พรุ่งนี้) | ~~Low~~ **แก้แล้ว** |
| ~~L3~~ ✅ | `DomainAuthorityRadar.tsx:24-31` + `DomainHealthTab.tsx:24` | Domain Authority Radar | แกน current ใช้ prop `metrics` (live, นอก visibility path) — ขัด rule 11 (redundant second source) | ~~Low~~ **แก้แล้ว** |
| ~~L4~~ ✅ | `ReportPage.tsx:100-116`, `KeywordPerformanceTab.tsx:24-41`, `OverviewTab.tsx:28` | KD Donut / KD Success / Traffic Pie / Coverage / KeywordReportTable | ใช้ keyword list จาก `useGetCustomerReport` (คนละ fetch กับ `currentKeywords` ใน context) — second source of truth | ~~Low~~ **แก้แล้ว** |
| ~~L5~~ ✅ | `SpamScoreTimeline.tsx:53-59`, `BacklinksVsRefDomains.tsx:56-62`, `TrendChartsSection.tsx:70-80` | 3 กราฟ Domain Health | เมื่อข้อมูลในช่วง < 3 จุด → ขยายเป็น all-time เงียบ ๆ ทั้งที่ UI ยังโชว์ period 7D/30D/90D | ~~Low~~ **แก้แล้ว** |
| ~~L6~~ ✅ | `BacklinksVsRefDomains.tsx:70` | Backlinks vs Ref Domains (เส้น ratio) | `ratio ?? 0` เมื่อ refDomains = 0 → เส้นจุ่มลง 0 แทนที่จะเว้น gap | ~~Low~~ **แก้แล้ว** |
| ~~L7~~ ✅ | `lib/historyCalculations/keyword-performance.ts:23-30` | KD Distribution Donut | kd นอกเซ็ต HARD/MEDIUM/EASY ถูกนับใน total แต่ไม่มี slice → % รวม < 100 | ~~Low~~ **แก้แล้ว** |
| ~~L8~~ ✅ | `KeywordPositionHeatmap.tsx:17-24` vs `:50-67` | Position Heatmap | cellClass มี 5 ระดับ (21–50 / >50) แต่ legend โชว์ 4 | ~~Low~~ **แก้แล้ว** |
| ~~L9~~ ✅ | `BracketTransitionsSankey.tsx:156-159` + `distribution.ts:173-176` | Bracket Transitions | ข้อความ empty state ("ต้องมี history ≥ 2 รอบ") ไม่ตรง logic (ไม่มี history ก็มี data ได้จาก fallback) | ~~Low~~ **แก้แล้ว** |
| ~~L10~~ ✅ | `lib/historyCalculations/charts.ts:152-154` | Top Keywords Snapshot (delta %) | delta เทียบกับ **record เก่าสุดตลอดกาล** ไม่ผูก period — ต่างจาก widget อื่นที่ผูก period | ~~Low~~ **แก้แล้ว** |

---

## 3. รายละเอียดต่อ finding

### C1 — Overall Domain Metrics: %change เป็น 0 เสมอ (Critical) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — แก้ใน `trends.ts` (`calculateMetricChange`) โดยกรอง synthetic current
> (`id === 'current'`) ออกก่อน sort → `previous` มาจาก snapshot จริงตัวล่าสุดแทนค่าตัวเอง
> ```ts
> // synthetic current (id='current') = ค่าปัจจุบันเอง — ใช้เป็น baseline ไม่ได้ (จะได้ 0% เสมอ)
> const sortedHistory = metricsHistory.filter((h) => h.id !== 'current').sort(sortByDateDesc)
> ```
> ผลข้างเคียง: caller เดียว (`OverallMetricsCard`) ทั้ง 4 การ์ดถูกแก้พร้อมกัน · เคส "มีแต่ synthetic"
> (ลูกค้าใหม่) ตอนนี้ตก `length === 0` → โชว์ badge "NEW" แทน `+0.0%` (ถูกต้องกว่าเดิม) ·
> ผ่าน `npm run lint` (0 errors) + `npm run build` (TS ผ่าน)

**ไฟล์**: `src/features/customer-report/presentation/lib/historyCalculations/trends.ts:78-90` เรียกโดย `OverallMetricsCard.tsx:46-57`

**สาเหตุ**: `calculateMetricChange` ใช้ `sortedHistory[0]` (record ใหม่สุด) เป็น "previous" — แต่ `metricsHistory` จาก `useHistoryContext()` มี **synthetic current** (`id='current'`, `dateRecorded=now`) prepend อยู่หัวแถวเสมอ (`getCustomerHistoryReport.ts:22-41`) ค่าใน synthetic current คือค่าเดียวกับ `metrics` (live) ที่การ์ดส่งเข้ามา → previous = current → 0% ตลอด

ฟังก์ชันนี้น่าจะเขียนก่อนยุคที่ use case เริ่ม prepend synthetic current แล้วไม่มีใครตามมาแก้

**Trace**:

```
metrics.organicTraffic (live) = 5,000
metricsHistory (context)      = [
  { id: 'current', organicTraffic: 5000, dateRecorded: 2026-06-10T10:00 },  ← synthetic
  { id: 'h1',      organicTraffic: 4000, dateRecorded: 2026-06-03 },
  { id: 'h2',      organicTraffic: 3000, dateRecorded: 2026-05-20 },
]

calculateMetricChange(5000, metricsHistory, 'organicTraffic')
→ sortByDateDesc → [0] = synthetic current → previousValue = 5000
→ percentage = ((5000 - 5000) / 5000) × 100 = 0      ← ผลปัจจุบัน: "+0.0%" (neutral)
→ ที่ถูก: เทียบ h1 = 4000 → +25.0% (up)
```

กระทบทั้ง 4 ตัว: Organic Traffic, Organic Keywords, Backlink, Ref.Domains — badge แสดง `+0.0%` neutral เสมอเมื่อมี history ≥ 1 รายการ (ซึ่งมีเสมอเพราะ synthetic)

**วิธีแก้ที่เสนอ** (ใน `trends.ts` — ข้าม synthetic current):

```ts
export const calculateMetricChange = (
  currentValue: number,
  metricsHistory: OverallMetricsHistory[],
  metricKey: keyof Omit<OverallMetricsHistory, 'id' | 'dateRecorded' | 'customerId'>,
): TrafficChangeData => {
  // synthetic current (id='current') คือค่าปัจจุบันเอง — ใช้เป็น baseline ไม่ได้
  const sortedHistory = metricsHistory
    .filter((h) => h.id !== 'current')
    .sort(sortByDateDesc)
  ...
}
```

**ผลกระทบข้าง**: caller เดียวคือ `OverallMetricsCard` (Grep ยืนยันแล้ว) — ปลอดภัย ส่วน `calculateTrafficChange` (per-keyword) ไม่โดน เพราะ `keywordHistory` ไม่มี synthetic

---

### H1 — `countTopN` นับ position ≤ 0 เป็น Top N (High) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — `countTopN` เปลี่ยนจาก `k.position !== null` เป็น `isRanked(k.position)`
> (`_shared.ts` — pos > 0) → sentinel 0/null ไม่ถูกนับเป็น Top N อีก · caller เดียว `computeKpiSnapshots`

**ไฟล์**: `kpis.ts:44-45` ใช้ที่ `:109-110` → แสดงใน `SummaryStatistics.tsx` ("Top 3 Rankings")

```ts
const countTopN = (keywords: Array<{ position: number | null }>, n: number): number =>
  keywords.filter((k) => k.position !== null && k.position <= n).length
```

ขาด `position > 0` — ขณะที่ `computeAvgPosition` ในไฟล์เดียวกัน (`:48-54`) กรอง `> 0` ถูกต้อง และ `_shared.ts` ก็มี `isRanked` ให้ใช้อยู่แล้ว

**Trace**:

```
currentKeywords = [ #1, #2, pos=0, pos=0, #15 ]   (pos=0 = unranked sentinel)
countTopN(currentKeywords, 3) = 4   ← นับ #1, #2, 0, 0
ที่ถูก = 2
→ การ์ด "Top 3 Rankings" โชว์ 4 (เกินจริง 2 เท่า) และ prevTop3 ก็ผิดแบบเดียวกัน → delta มั่ว
```

**วิธีแก้ที่เสนอ**:

```ts
import { getValueAtOrBefore, isRanked, latestRecordByKeywordBeforeCutoff } from './_shared'

const countTopN = (keywords: Array<{ position: number | null }>, n: number): number =>
  keywords.filter((k) => isRanked(k.position) && k.position <= n).length
```

**ผลกระทบข้าง**: ใช้เฉพาะใน `computeKpiSnapshots` (current + prev + ไม่กระทบ top3Sparkline ซึ่งกรอง `isRanked` แล้ว)

---

### H2 — `computeTopMovers` ตีความ position 0 เป็นอันดับจริง → gainer/loser กลับด้าน (High) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — guard `isRanked` ทั้ง prev + curr ก่อนคำนวณ delta → unranked↔ranked
> ได้ delta null → ถูกตัดออกจาก gainer/loser (เลือก "ตัดออก" ตาม decision เชิง product)
> ผลพลอยได้: `computeRoiHeadline` (improved/declined count) + `HeroStatusCard` ถูกต้องพร้อมกัน

**ไฟล์**: `distribution.ts:71-84` → กระทบ `TopMovers.tsx:66`, `computeRoiHeadline` (`kpis.ts:160`) → `HeroStatusCard.tsx:21`

```ts
const delta = prevPos !== null && currPos !== null ? currPos - prevPos : null
```

เช็คแค่ null — sentinel 0 หลุดเข้าสมการ

**Trace** (period 30 วัน):

```
kw "รับทำ seo":  prev (30 วันก่อน) position = 0 (unranked) → current = #5
  delta = 5 - 0 = +5  → ถูกจัดเป็น LOSER "หล่นลง 5 อันดับ"
  ความจริง: เพิ่งติดอันดับ #5 = ข่าวดีที่สุดของลูกค้า

kw "ราคา seo":  prev = #4 → current position = 0 (หลุดอันดับ)
  delta = 0 - 4 = -4  → ถูกจัดเป็น GAINER "ขยับขึ้น 4 อันดับ" (โชว์ "#4 → #0")
  ความจริง: หลุดจากหน้าผลค้นหา = ข่าวร้าย
```

ผลลามถึง Hero Status Card: `improvedKeywordCount`/`declinedKeywordCount` สลับฝั่งสำหรับ keyword กลุ่มนี้ (`computeRoiHeadline` ใช้ `computeTopMovers` limit 1000)

**วิธีแก้ที่เสนอ** (`distribution.ts`):

```ts
import { isRanked, latestRecordByKeywordBeforeCutoff, sortByDateAsc } from './_shared'

const movements: KeywordMovement[] = currentKeywords.map((curr) => {
  const prevRaw = historicalByKw.get(curr.keyword)?.position ?? null
  const prevPos = isRanked(prevRaw) ? prevRaw : null
  const currPos = isRanked(curr.position) ? curr.position : null
  const delta = prevPos !== null && currPos !== null ? currPos - prevPos : null
  ...
})
```

> หมายเหตุ: แบบนี้ตัดเคส unranked→ranked / ranked→unranked ออกจาก movers ไปก่อน (ปลอดภัยสุด)
> ถ้าอยากนับเป็น gainer/loser จริง ๆ ต้องเพิ่ม special-case แยก (เช่น delta สังเคราะห์จาก
> `POSITION_CLIP_THRESHOLD`) — ควรตัดสินใจเชิง product ก่อน

**ผลกระทบข้าง**: `TopMovers`, `HeroStatusCard`, `computeRoiHeadline` — ทั้งสามได้ผลถูกขึ้นพร้อมกัน ไม่มี caller อื่น

---

### H3 — `computeKeywordVelocity` ปัญหา sentinel 0 แบบเดียวกับ H2 (High) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — เปลี่ยน guard `=== null` เป็น `!isRanked(curr.position) || !isRanked(prev.position)`
> → จุด unranked↔ranked ไม่เข้า scatter (กัน quadrant/สีสลับ) · caller เดียว `KeywordVelocityScatter`

**ไฟล์**: `keyword-performance.ts:137-153` → `KeywordVelocityScatter.tsx:46`

```ts
if (curr.position === null || prev.position === null) continue
const posDelta = curr.position - prev.position
```

**Trace**:

```
prev position = 0 (unranked), curr = #3, traffic +50
  posDelta = 3 - 0 = +3 (บวก = แย่ลง) → quadrant 'hidden'
  ความจริง: rising star ชัด ๆ (เพิ่งติด #3)

prev = #5, curr = 0 (หลุดอันดับ), traffic -100
  posDelta = -5 (ลบ = ดีขึ้น) → quadrant 'cooling'
  ความจริง: falling (หลุดอันดับ + traffic หาย)
```

จุดวาดผิด quadrant + สีผิด (เขียว/แดงสลับ) ใน scatter

**วิธีแก้ที่เสนอ**: เพิ่ม guard เหมือน H2

```ts
import { isRanked, latestRecordByKeywordBeforeCutoff } from './_shared'

for (const curr of currentKeywords) {
  const prev = historicalByKw.get(curr.keyword)
  if (!prev) continue
  if (!isRanked(curr.position) || !isRanked(prev.position)) continue

  const posDelta = curr.position - prev.position
  ...
}
```

**ผลกระทบข้าง**: caller เดียว (`KeywordVelocityScatter`)

---

### H4 — KPI "Total Keywords" เทียบข้ามแหล่งข้อมูลคนละความหมาย (High) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — เลือก "นับ tracked keyword" (decision เชิง product): current =
> `currentKeywords.length` (เลขเดิม), `prevTotal` = จำนวน distinct keyword ≤ cutoff จาก
> `latestRecordByKeywordBeforeCutoff(keywordHistory)`, sparkline = distinct keyword/วันจาก
> `keywordHistory` → ทั้ง 3 ค่ามาจาก source เดียว (tracked) · ตัด `organicKeywords` (โดเมน) ออก
> Sweep dead code: `buildSparkline` ตาย → ลบ · param `metricsHistory` ของ `computeKpiSnapshots`
> ตาย → ลบ + แก้ caller `SummaryStatistics` (ลบ destructure ที่ค้าง) · ผ่าน `tsc --noEmit` + `npm run lint` (0 errors)

**ไฟล์**: `kpis.ts:77-79,113` → `SummaryStatistics.tsx:158-165`

```ts
const currentTotal = currentKeywords.length                                    // จำนวน keyword ที่ track ในรายงาน
const prevTotal = getValueAtOrBefore(metricsHistory, daysAgo, (r) => r.organicKeywords)  // organic keywords ทั้งโดเมน (กรอกมือจาก Ahrefs)
const totalSparkline = buildSparkline(metricsHistory, (r) => r.organicKeywords)
```

`currentKeywords` คือแถว `KeywordReport` ที่ทีม SEO เลือก track (เช่น 25 คำ) ส่วน `organicKeywords` ใน `OverallMetrics` คือจำนวน organic keywords ของทั้งโดเมน (เช่น 1,400) — คนละ entity คนละ scale

**Trace**:

```
track อยู่ 25 คำ, organicKeywords snapshot 7 วันก่อน = 1,400
→ การ์ดโชว์ value 25, delta = 25 - 1400 = -1,375 ("แย่ลง 1,375" สีแดง)
→ sparkline ข้าง ๆ วิ่งอยู่แถว 1,400 — คนละโลกกับเลข 25 บนการ์ด
```

(จะมองไม่เห็นปัญหาก็ต่อเมื่อ admin บังเอิญกรอก organicKeywords = จำนวนที่ track พอดี)

**วิธีแก้ที่เสนอ** — ให้ทั้งคู่มาจากแหล่งเดียว เช่นนับ distinct keyword จาก `keywordHistory`:

```ts
// ---- Total Keywords (นับจาก source เดียวกัน: tracked keywords) ----
const currentTotal = currentKeywords.length
const prevTotalMap = latestRecordByKeywordBeforeCutoff(keywordHistory, cutoffMs)
const prevTotal = prevTotalMap.size > 0 ? prevTotalMap.size : null
```

และเปลี่ยน sparkline เป็นจำนวน distinct keyword ต่อวันจาก `keywordHistory` (หรือถ้า intent เดิมคือ "Organic Keywords ของโดเมน" → เปลี่ยน `currentTotal` เป็น `metricsHistory[0].organicKeywords` แทน แล้วแก้ label การ์ด — ต้องเลือกอย่างใดอย่างหนึ่ง)

**ผลกระทบข้าง**: เฉพาะ `computeKpiSnapshots` → `SummaryStatistics`

---

### M1 — Forecast dedupe รายวันด้วย UTC ใน timezone ไทย (Medium) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — extract helper `localDayKey()` (local-day, zero-padded → เรียง localeCompare ได้)
> ไป `_shared.ts` แล้วใช้แทน `toISOString()` ใน `forecast.ts` (dedupe รายวัน) · ใช้ helper เดียวกันที่
> `kpis.ts` sparkline daily-group (×2) และ refactor `deduplicateByDay` (`charts.ts`) มาใช้ร่วม (DRY) ·
> caller เดียว `TrafficForecastCone` · re-export `localDayKey` ผ่าน barrel `historyCalculations/index.ts`

**ไฟล์**: `forecast.ts:52-59`

```ts
const dayKey = new Date(h.dateRecorded).toISOString().split('T')[0]   // ← UTC
```

ไทยคือ UTC+7 — record ที่บันทึก 00:00–06:59 น. ตกเป็น "เมื่อวาน" ใน UTC ทำให้เป้าหมายใน comment (`กัน synthetic current ชนกับ history วันเดียวกัน`) ล้มเหลว และกลืนจุดข้ามวันผิดตัวได้

**Trace** (วันนี้ = 10 มิ.ย. เวลาไทย):

```
admin แก้ metrics วันนี้ 06:00 น. → history เก็บค่าก่อนแก้ (organicTraffic 5,000)
  dateRecorded = 2026-06-10T06:00+07:00 = 2026-06-09T23:00Z → dayKey "2026-06-09"
synthetic current 10:00 น. (organicTraffic 5,500)
  = 2026-06-10T03:00Z → dayKey "2026-06-10"
→ ไม่ถูก dedupe — เกิด 2 จุดห่างกัน 4 ชม. (5,000 → 5,500) ในวันเดียวกัน
→ regression เห็น "โต 500 ใน 0.17 วัน" = slope พุ่งผิดจริง ทั้งที่ตั้งใจให้เหลือจุดเดียว/วัน

กลับด้าน: record 9 มิ.ย. 20:00 น. (13:00Z, dayKey 06-09) ถูก record 10 มิ.ย. 06:00 น.
(dayKey 06-09 เหมือนกัน, t ใหม่กว่า) เขียนทับ → ค่าจริงของวันที่ 9 หายจาก regression
```

**วิธีแก้ที่เสนอ** — ใช้ local day key แบบเดียวกับ `deduplicateByDay` (`charts.ts:34`):

```ts
const d = new Date(h.dateRecorded)
const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
```

**ผลกระทบข้าง**: เฉพาะ forecast — แต่ pattern UTC เดียวกันโผล่อีก 2 จุด (M2 และ `kpis.ts:94` sparkline รายวันจัดกลุ่มวันเพี้ยนช่วง 00:00–06:59 น.) ควรแก้พร้อมกันทั้งสามให้เป็น local-day helper เดียว (เสนอ export จาก `_shared.ts`)

---

### M2 — KeywordTrendChart แทน history "วันนี้" ด้วย UTC dayKey (Medium) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — เทียบ/ลบ history "วันนี้" ด้วย `localDayKey()` (helper เดียวกับ M1) แทน UTC
> `toISOString().split('T')[0]` → record ช่วง 00:00–06:59 น. ไทย ถูกแทนด้วยจุด current ถูกต้อง ไม่เกิดจุดซ้ำ
> ทั้ง position และ traffic · import `localDayKey` จาก barrel `./lib/historyCalculations`

**ไฟล์**: `KeywordTrendChart.tsx:221-228`

```ts
const dayKey = currentDate.toISOString().split('T')[0]
records = historyRecords.filter((r) => r.date.toISOString().split('T')[0] !== dayKey)
```

ตั้งใจลบ history ของ "วันนี้" แล้วแทนด้วยจุด current — แต่เทียบด้วย UTC: history ที่บันทึกวันนี้ 00:00–06:59 น. ไทย มี UTC date เป็นเมื่อวาน → ไม่ถูกลบ → เส้นมี 2 จุดวันเดียวกัน (ค่าเก่าก่อนแก้ + ค่า current) ทั้ง position และ traffic

**Trace**: เหมือน M1 — record 06:00 น. (5,000) + จุด current (5,500) โผล่คู่กันในวันนี้

**วิธีแก้ที่เสนอ**: เทียบ local date เช่นเดียวกับ M1 (extract helper `localDayKey(date)` ไว้ที่ `_shared.ts` แล้วใช้ทั้ง forecast/chart/kpis)

---

### M3 — `computeAnomalies`: z > 2.5 เป็นไปไม่ได้เมื่อจุดข้อมูล < 8 (Medium) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — เลือก **ทางเลือก A (leave-one-out z-score)**: mean/std คำนวณจากจุด "อื่น"
> (ไม่รวมจุดที่กำลังทดสอบ) → flag z>2.5 ได้จริงแม้จุดน้อย ไม่ติดเพดาน √(n−1) · guard `length < 4` →
> all false, `std === 0` → flag จุดที่ต่างจาก baseline · คง semantics "z>2.5" ที่ UI เคลม (ไม่ต้องแก้ข้อความ) ·
> signature เดิม → caller ทั้ง 3 (`SpamScoreTimeline`, `TrendChartsSection`, `KeywordTrendChart`) ได้ผลถูกขึ้นพร้อมกัน

**ไฟล์**: `charts.ts:70-77` — ใช้ใน `SpamScoreTimeline.tsx:64`, `TrendChartsSection.tsx:93`, `KeywordTrendChart.tsx:259` (UI เขียนว่า "จุดวงแหวน = Outlier (z > 2.5)")

ใช้ **population std** ที่รวม outlier ไว้ใน mean/std เอง — ค่า |z| สูงสุดที่เป็นไปได้ของชุดข้อมูล n จุดที่มี outlier เดี่ยวคือ **√(n−1)**:

```
n = 3 → z_max = √2 ≈ 1.41
n = 5 → z_max = 2.00
n = 7 → z_max = √6 ≈ 2.45   ← ยังไม่ถึง 2.5
n = 8 → z_max = √7 ≈ 2.65   ← เริ่มเป็นไปได้
```

**Trace** (n = 5, spike ชัด ๆ):

```
spamScore = [1, 1, 1, 1, 9]
mean = 2.6, std(population) = √((4·2.56 + 40.96)/5) = √10.24 = 3.2
z(9) = (9 - 2.6)/3.2 = 2.0  < 2.5 → ไม่ flag
→ spike 9 เท่าของ baseline มองข้าม — ฟังก์ชันรับ n ≥ 3 แต่ flag ได้จริงเมื่อ n ≥ 8 เท่านั้น
```

ลูกค้าที่อัปเดต metrics เดือนละครั้ง (period 90D = ~3 จุด) จะไม่มีวันเห็นวงแหวน outlier เลย

**วิธีแก้ที่เสนอ** (เลือกหนึ่ง):

```ts
// ทางเลือก A: leave-one-out z-score — คำนวณ mean/std โดยตัดจุดที่กำลังทดสอบออก
export const computeAnomalies = (values: number[], zThreshold: number = 2.5): boolean[] => {
  if (values.length < 4) return values.map(() => false)
  return values.map((v, i) => {
    const others = values.filter((_, j) => j !== i)
    const mean = others.reduce((s, x) => s + x, 0) / others.length
    const variance = others.reduce((s, x) => s + (x - mean) ** 2, 0) / others.length
    const std = Math.sqrt(variance)
    if (std === 0) return v !== mean
    return Math.abs((v - mean) / std) > zThreshold
  })
}
```

(ทางเลือก B: ใช้ median + MAD ซึ่งทนต่อ outlier กว่า / ทางเลือก C: ลด threshold + อัปเดตคำอธิบายใน UI ให้ตรงความจริง)

**ผลกระทบข้าง**: ทั้ง 3 กราฟที่ใช้ — พฤติกรรม flag จะเปลี่ยน (เริ่มจับ outlier ได้จริง) ควรตรวจตาด้วยข้อมูลจริงหลังแก้

---

### M4 — anomaly ใน KeywordTrendChart โดน zero-padding จาก timestamp ของ keyword อื่น (Medium) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — คำนวณ anomaly จากเฉพาะแถวที่ keyword นั้นมีค่าจริง (`realIdx = rows ที่ trafficKey != null`)
> แล้ว map flag กลับเข้า row เดิม → แถวผี (undefined ของ keyword อื่น) ไม่ถูกแทนด้วย 0 → mean/std ไม่ถูกบิด ·
> caller เดียว (กราฟนี้) · `AnomalyDot` อ่าน key `traffic_<kw>__anomaly` เหมือนเดิม

**ไฟล์**: `KeywordTrendChart.tsx:256-263`

```ts
const trafficVals = rows.map((r) => Number(r[trafficKey] ?? 0))
```

`rows` คือ union ของ timestamp ของ "ทุก keyword ที่เลือก" — แถวที่ keyword นี้ไม่มี record จะกลายเป็น 0 แล้วถูกนับเข้า mean/std

**Trace**:

```
เลือก 2 คำ: A มี record 9 จุด traffic = 100 ทุกจุด, B มี record อีก 1 วัน (A ไม่มีวันนั้น)
→ trafficVals ของ A = [100×9, 0]
mean = 90, std = √((9·100 + 8100)/10) = √900 = 30
z(0) = 3.0 → แถวผี (A ไม่มีข้อมูล) ถูก flag เป็น anomaly
z(100) = 0.33 — สถิติของจุดจริงถูกบิดด้วยศูนย์ปลอม
(จุดผีไม่ถูกวาด dot เพราะ dataKey เป็น undefined — แต่ mean/std ที่จุดจริงใช้ก็เพี้ยนไปแล้ว
และยิ่งเลือกหลาย keyword ที่วันที่ไม่ตรงกัน ยิ่งมีศูนย์ปนมาก)
```

**วิธีแก้ที่เสนอ** — คำนวณ anomaly จากเฉพาะแถวที่มีค่าจริง แล้วค่อย map flag กลับ:

```ts
selectedKeywords.forEach((keyword) => {
  const trafficKey = `traffic_${keyword}`
  const realIdx = rows.flatMap((r, i) => (r[trafficKey] != null ? [i] : []))
  const flags = computeAnomalies(realIdx.map((i) => Number(rows[i][trafficKey])))
  realIdx.forEach((rowIdx, j) => {
    rows[rowIdx][`${trafficKey}__anomaly`] = flags[j]
  })
})
```

**ผลกระทบข้าง**: เฉพาะกราฟนี้ — `TrendChartsSection` ไม่โดนเพราะทุก series มีค่าทุกแถว (มาจาก `filteredHistory` ชุดเดียว)

---

### M5 — Forecast CI กว้างคงที่ ไม่ขยายตามระยะพยากรณ์ (Medium) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — เปลี่ยน CI คงที่เป็น prediction interval ที่ขยายตามระยะ: ต่อวันพยากรณ์
> `ci = 1.96·s·√(1 + 1/n + (x−x̄)²/Sxx)` (Sxx = `den` = Σ(x−x̄)² ที่คำนวณไว้แล้ว, กัน 0 ด้วย `max(den, 1e-9)`) →
> cone บานตาม horizon ตามจริง · caller เดียว `TrafficForecastCone`

**ไฟล์**: `forecast.ts:92-93,121-123`

```ts
const ci = 1.96 * residualStd
...
lower: Math.max(0, pred - ci),
upper: pred + ci,
```

prediction interval ของ linear regression ที่ถูกต้องคือ `t·s·√(1 + 1/n + (x−x̄)²/Sxx)` — กว้างขึ้นเมื่อ x ออกห่างจากข้อมูล การใช้ ±1.96·s คงที่ underestimate ความไม่แน่นอนที่ +30 วัน อย่างมีนัย และ UI เคลม "ช่วงความเชื่อมั่น ~95%"

**Trace** (n = 5 จุด, ช่วงข้อมูล 28 วัน, x̄ = 14, Sxx = 490, residualStd = 200):

```
ที่ x = วันสุดท้ายของข้อมูล (x = 28):  factor = √(1 + 1/5 + 196/490) = √1.6 = 1.26
ที่ x = +30 วันข้างหน้า (x = 58):       factor = √(1 + 0.2 + 1936/490) = √5.15 = 2.27
→ CI ปลาย cone ควรกว้างกว่า ±1.96·s ราว 2.27 เท่า — ตอนนี้แสดงแคบเกินจริง ~56%
```

**วิธีแก้ที่เสนอ**:

```ts
const sxx = den // Σ(x - meanX)² คำนวณไว้แล้ว
for (let d = 1; d <= daysAhead; d += 1) {
  const x = (future - t0) / DAY_MS
  const widen = Math.sqrt(1 + 1 / n + (x - meanX) ** 2 / Math.max(sxx, 1e-9))
  const ci = 1.96 * residualStd * widen
  ...
}
```

(เคร่งขึ้นอีกได้ด้วย t-multiplier ตาม df = n−2 แทน 1.96 แต่ผลต่างน้อยกว่า factor √(…))

**ผลกระทบข้าง**: เฉพาะ Traffic Forecast Cone — cone จะบานขึ้นตามจริง

---

### M6 — Coverage Snapshot: "อัปเดต ไม่กี่นาทีที่แล้ว" เสมอ (Medium) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — `lastUpdated` = `dateRecorded` ของ record แรกที่ `id !== 'current'`
> (ข้าม synthetic current ที่ใช้เวลา fetch) → ตรง semantics "เวลาอัปเดตจริงครั้งล่าสุด" (∵ history เก็บ
> ค่าก่อนแก้ ณ เวลาที่แก้) · `computeCoverageStats` signature เดิม → `CoverageSnapshotCard` ไม่ต้องแก้

**ไฟล์**: `kpis.ts:183-192` (`computeCoverageStats`) → `CoverageSnapshotCard.tsx:55`

```ts
lastUpdated: metricsHistory.length > 0 ? new Date(metricsHistory[0].dateRecorded) : null,
```

`metricsHistory[0]` = synthetic current ซึ่ง `dateRecorded = new Date()` ณ เวลา API ตอบ (`getCustomerHistoryReport.ts:36`) — ไม่ใช่เวลาที่ admin อัปเดตข้อมูลจริง

**Trace**:

```
admin อัปเดต metrics ล่าสุด 1 มี.ค. — วันนี้ 10 มิ.ย. ลูกค้าเปิดรายงาน
metricsHistory = [ synthetic(dateRecorded = 10 มิ.ย. 10:00), real(1 มี.ค.), ... ]
→ lastUpdated = 10 มิ.ย. 10:00 → "อัปเดต ไม่กี่นาทีที่แล้ว"
ที่ถูก: "1 มี.ค. 2569" (ข้อมูลเก่า 3 เดือน — ลูกค้าควรรู้)
```

**วิธีแก้ที่เสนอ**:

```ts
export const computeCoverageStats = (
  topKeywords: Array<unknown>,
  otherKeywords: Array<unknown>,
  metricsHistory: OverallMetricsHistory[],
): CoverageStats => {
  // synthetic current (id='current') ใช้ dateRecorded = เวลา fetch — ไม่ใช่เวลาอัปเดตจริง
  const lastRealRecord = metricsHistory.find((r) => r.id !== 'current')
  return {
    trackedKeywords: topKeywords.length + otherKeywords.length,
    topKeywordsCount: topKeywords.length,
    otherKeywordsCount: otherKeywords.length,
    lastUpdated: lastRealRecord ? new Date(lastRealRecord.dateRecorded) : null,
  }
}
```

> ข้อจำกัด: history record เก็บ "ค่าก่อนแก้" ณ เวลาที่แก้ → `dateRecorded` ของ record จริงตัวแรก
> = เวลาอัปเดตครั้งล่าสุดพอดี — ตรง semantics ที่ต้องการ (ทางเลือก: ส่ง `OverallMetrics.dateRecorded`
> ของจริงมากับ payload แต่ต้องแตะ use case ซึ่งกระทบกราฟอื่น — ไม่แนะนำ)

---

### M7 — position 0 ใน sparkline + Avg Position หลอกว่า "ดีขึ้น" (Medium) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — (ก) `computeSparklineTopN` เปลี่ยน filter `h.position != null` → `isRanked(h.position)`
> (ตัด sentinel 0 → จุดหลุดอันดับเป็น gap ไม่ใช่ยอด "#0") + ลบ dead branch `?? POSITION_CLIP_THRESHOLD`
> และ import ที่ค้างใน `charts.ts` · (ข) `currentAvg === null` → คืน snapshot `previous: null`
> (`{ current: 0, previous: null, delta: 0, pct: null, direction: 'neutral' }`) → `buildDeltaInfo` คืน null →
> badge หาย, การ์ดโชว์ '-' · caller เดียว `SummaryStatistics`

**ไฟล์**: `charts.ts:144-149` (`computeSparklineTopN`) และ `kpis.ts:114`

(ก) sparkline position:

```ts
const records = keywordHistory.filter((h) => h.reportId === kw.id && h.position != null)
...
v: Number(r.position ?? POSITION_CLIP_THRESHOLD),
```

filter ปล่อย `position = 0` ผ่าน (0 ≠ null) — `MiniSparkline` ฝั่ง widget ใช้ `invert` (ค่าน้อย = สูงขึ้น) → ช่วงที่หลุดอันดับ (0) กลายเป็นยอดกราฟ "อันดับดีสุด"
(ส่วน `?? POSITION_CLIP_THRESHOLD` เป็น dead branch — filter ตัด null ไปแล้ว)

**Trace**: positions ใน history = `[12, 8, 0, 6]` → sparkline แสดงจุดที่ 3 พุ่งขึ้นสุด (ตีความว่าเคยอยู่ "#0") ทั้งที่คือช่วงหลุดอันดับ

**วิธีแก้**: `h.position != null` → `isRanked(h.position)` (จุดหลุดอันดับ → เว้น gap)

(ข) Avg Position เมื่อไม่มี keyword ติดอันดับ (`kpis.ts:114`):

```ts
avgPosition: { ...computeDelta(currentAvg ?? 0, prevAvg), sparkline: avgSparkline },
```

**Trace**:

```
สัปดาห์ก่อนติดอันดับเฉลี่ย #8.5 → สัปดาห์นี้หลุดหมด (currentAvg = null → 0)
computeDelta(0, 8.5) → delta = -8.5, direction 'down' → lowerIsBetter → badge เขียว
"Avg Position ดีขึ้น 8.5"  ← ความจริงคือหายนะ (ตัวเลขการ์ดโชว์ '-' แต่ badge ยังเขียว)
```

**วิธีแก้**: ถ้า `currentAvg === null` ให้คืน snapshot ที่ `previous: null` (UI จะแสดง "ข้อมูลยังไม่พอเทียบ" เอง):

```ts
avgPosition: {
  ...(currentAvg === null
    ? { current: 0, previous: null, delta: 0, pct: null, direction: 'neutral' as const }
    : computeDelta(currentAvg, prevAvg)),
  sparkline: avgSparkline,
},
```

---

### L1 — ตัวเลขติดลบถูกตัดเครื่องหมาย (Low) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — `sign = percentage >= 0 ? '+' : '-'` ทั้ง `MetricChangeIndicator` + `TrafficProgressBar` → ค่าติดลบโชว์ `-12.3%` ตรงกับ `HeroStatusCard.formatPct`

`MetricChangeIndicator.tsx:42-44` และ `TrafficProgressBar.tsx:48-51`:

```ts
const sign = percentage >= 0 ? '+' : ''
return `${sign}${abs}%`            // -12.3 → "12.3%" (ไม่มีลบ)
```

ทิศทางสื่อด้วยไอคอน/สีก็จริง แต่ขัดกับ `HeroStatusCard.formatPct` (`HeroStatusCard.tsx:10-14`) ที่แสดง `-12.3%` ครบ — ตัวเลขเดียวกันคนละหน้าตาข้าม widget. แก้: `const sign = percentage >= 0 ? '+' : '-'`

### L2 — เส้น "วันนี้" ใน Forecast ปักผิดจุด 1 วัน (Low) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — `ReferenceLine x` เปลี่ยนเป็น `[...data].reverse().find((d) => d.actual != null)?.label` (จุด bridge = วันนี้จริง) แทนจุดพยากรณ์ d=+1

`TrafficForecastCone.tsx:113-114`: `data.find((d) => d.actual == null && d.predicted != null)` — จุด bridge (วันนี้จริง) มีทั้ง actual และ predicted จึงถูกข้าม → ได้จุด d=+1 (พรุ่งนี้) มาแปะป้าย "วันนี้". แก้: ใช้จุดสุดท้ายที่ `actual != null` (`[...data].reverse().find((d) => d.actual != null)?.label`)

### L3 — DomainAuthorityRadar รับค่า live เป็นแกน current (Low — ขัด rule 11) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — radar อ่าน `metricsHistory[0]` (synthetic current) จาก `useHistoryContext()` แทน prop `metrics` · ลบ prop `metrics` + การส่งจาก `DomainHealthTab` → single source ตาม rule 11

`DomainAuthorityRadar.tsx:24-31` รับ prop `metrics` จาก `reportData` (`DomainHealthTab.tsx:24`) มาเป็นแกน "ปัจจุบัน" ของ radar — ค่าตัวเลขเท่ากับ synthetic current (`metricsHistory[0]`) จึงไม่ผิดเชิงเลข **แต่เป็น redundant second source ตาม rule 11 ข้อ 2** และมาจากคนละ fetch (อาจไม่ sync ชั่วขณะหลัง mutation) แก้: อ่าน `metricsHistory[0]` จาก context แทน prop แล้วลบ prop ทิ้ง (sweep caller ตาม rule 10)

### L4 — keyword list สอง fetch (Low — สังเกตตาม rule 11) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — converge ทั้งหมดมา `currentKeywords` จาก context: `KeywordPerformanceTab` split top/other ด้วย `isTopReport` แล้วป้อน Donut/SuccessRate/Pie/Table; `CoverageSnapshotCard` อ่าน context ตรง; `ReportPage` เลิกส่ง `reportData.topKeywords/otherKeywords` ลง 2 tab · `KdDistributionDonut`/`KdSuccessRateBar`/`TopKeywordsByTrafficPie`/`KeywordReportTable` คงเป็น prop-driven (reusable; Donut ใช้ใน AI tab ด้วย) — เปลี่ยน "แหล่ง" ที่ระดับ tab · `KeywordReportTable.keywords` retype เป็น `CurrentKeyword[]` (kd: string) · ผลข้างเคียง: ลำดับแถวตารางเป็น traffic-desc · BE report payload ไม่แตะ (ยังคืน top/other ตามเดิม แต่ FE ไม่อ่านแล้ว)

`KdDistributionDonut` / `KdSuccessRateBar` / `TopKeywordsByTrafficPie` / `CoverageSnapshotCard` / `KeywordReportTable` รับ keyword จาก `useGetCustomerReport` (`reportData.topKeywords/otherKeywords`) ขณะที่ context มี `currentKeywords` (เนื้อหาเดียวกัน คนละ endpoint/cache) — ค่าปัจจุบันไม่ผ่าน visibility filter อยู่แล้วจึงไม่ข้ามการติ๊ก แต่เป็น second source ที่อาจ stale ไม่พร้อมกัน (staleTime ต่างกัน) ควร converge เป็น `currentKeywords` จาก context (เว้น `KeywordReportTable` ที่ต้องแยก top/other — `currentKeywords` มี `isTopReport` อยู่แล้ว แยกได้)

### L5 — ขยายช่วงเวลาเงียบ ๆ เมื่อข้อมูลในช่วง < 3 จุด (Low) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — extract `ChartFallbackNote` (caption "ข้อมูลในช่วงที่เลือกไม่พอ · แสดงทั้งหมด") · ทั้ง 3 กราฟ (Spam/Backlinks/TrendCharts) คืน flag `isAllTimeFallback` จาก memo แล้วโชว์ note เมื่อ fallback ทำงาน

`SpamScoreTimeline.tsx:53-59`, `BacklinksVsRefDomains.tsx:56-62`, `TrendChartsSection.tsx:70-80`: เลือก 7D แล้วข้อมูลไม่พอ → โชว์ all-time โดยไม่บอกผู้ใช้ → ผู้ใช้ตีความกราฟเป็น "7 วันล่าสุด" ทั้งที่เป็นทั้งปี เสนอ: แสดง caption "ข้อมูลในช่วงไม่พอ — แสดงทั้งหมด" เมื่อ fallback ทำงาน

### L6 — ratio ?? 0 เมื่อ refDomains = 0 (Low) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — row `ratio` คงค่า null (ตัด `?? 0`) · `<Line dataKey="ratio" connectNulls={false}>` → เว้น gap · tooltip formatter guard `if (v == null) return []`

`BacklinksVsRefDomains.tsx:70`: `computeBacklinkRatio` คืน null (ถูกต้อง) แต่ถูกแปลงเป็น 0 ก่อนเข้าเส้นกราฟ → เส้น ratio จุ่ม 0 เหมือน diversity ดีมาก ทั้งที่ไม่มีข้อมูล แก้: ปล่อย null แล้วให้ `<Line connectNulls={false}>` เว้นช่อง (type ของ row ต้องรับ `number | null`)

### L7 — KD แปลกถูกนับใน total แต่ไม่มี slice (Low) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — `groupKeywordsByKd` นับ `total` เฉพาะ kd ที่ valid (HARD/MEDIUM/EASY) → % ของ slice รวม = 100, เลขกลาง donut = ผลรวม slice (แก้ที่ calc ไม่แตะ UI)

`keyword-performance.ts:23-30`: kd ที่ไม่ใช่ HARD/MEDIUM/EASY → `total` รวมแต่ slice ไม่มี → % ใน tooltip (หารด้วย total) รวมกันไม่ถึง 100 และเลขกลาง donut ≠ ผลรวม slice. ปัจจุบัน enum ใน DB คุมไว้ จึงยังไม่ออกอาการ — กันไว้: นับเฉพาะที่ valid หรือเพิ่ม bucket "อื่น ๆ"

### L8 — Heatmap legend 4 สี แต่ cell มี 5 ระดับ (Low) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — แยก legend "21+" เป็น "21–50" (`destructive/40`) + "50+" (`destructive/60`) → legend 5 ระดับตรงกับ cellClass

`KeywordPositionHeatmap.tsx:17-24` มี `pos ≤ 50 → destructive/40` กับ `> 50 → destructive/60` แต่ legend (`:50-67`) มีถึงแค่ "21+" สีเดียว — ผู้ใช้แยกเฉดแดง 2 ระดับไม่ได้

### L9 — ข้อความ empty state ของ Sankey ไม่ตรง logic (Low) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — เปลี่ยนข้อความเป็น "ยังไม่มีข้อมูลตำแหน่ง keyword สำหรับแสดงการเปลี่ยนแปลง" → ตรงกับเงื่อนไขจริง (`hasData=false` เมื่อไม่มี keyword ที่มี position ทั้งสองฝั่ง) ไม่อ้าง "history ≥ 2 รอบ" ที่ไม่ตรง logic

`BracketTransitionsSankey.tsx:156-159` บอก "ต้องมี history ≥ 2 รอบ" แต่ `computeBracketTransitions` (`distribution.ts:173-176`) มี fallback ใช้ record เก่าสุด และนับ keyword ที่ไม่มี history เลยเป็น `missing → current` ได้ → `hasData = true` ได้แม้ไม่มี history (ข้อความจะไม่มีวันโชว์ในเคสนั้น และเคสที่โชว์ก็อธิบายผิด)

### L10 — Sparkline grid delta เทียบกับ record เก่าสุดตลอดกาล (Low) — ✅ แก้แล้ว 2026-06-10

> **สถานะ: RESOLVED** — `computeSparklineTopN` รับ `period` เพิ่ม → baseline = record ล่าสุดที่ ≤ cutoff (ผูก period เหมือน Top Movers/Velocity/Hero) · ไม่มี baseline → delta 0, deltaPct null ('—') · caller `TopKeywordsSparklineGrid` ส่ง `period` จาก `useReportFilters`

`charts.ts:152-154`: `prevTraffic = records[0]` (records sort **asc** → ตัวแรก = เก่าสุด) → "% เปลี่ยนแปลง" ของ Top Keywords Snapshot คือ "เทียบจุดเริ่มต้นทั้งหมดของ history" ไม่ผูก period — ขณะที่ Top Movers / Velocity / Hero ผูก period ทั้งหมด ผู้ใช้เห็นเปอร์เซ็นต์สองชุดที่ไม่ตรงกันโดยไม่มีคำอธิบาย เสนอ: ระบุใน UI ("เทียบตั้งแต่เริ่ม track") หรือเปลี่ยนไปใช้ cutoff ตาม period เหมือนตัวอื่น

---

## 4. ข้อสงสัย / ควรตรวจเพิ่ม (ยังไม่นับเป็น bug — ยืนยันด้วย trace ไม่ได้จากโค้ดอย่างเดียว)

1. **คีย์จับคู่ history ไม่สม่ำเสมอ**: `computeTopMovers`/`computeKeywordVelocity`/`computeKpiSnapshots` จับคู่ด้วย **`keyword` (string)** แต่ `computeBracketTransitions`/`computeSparklineTopN`/`calculateTrafficChange` ใช้ **`reportId`** — ถ้ามีการแก้ข้อความ keyword หรือลบแล้วสร้างใหม่ สอง widget จะเล่าเรื่องไม่ตรงกัน (string match หลุด/ชนกันได้ ขณะ reportId เปลี่ยนเมื่อสร้างใหม่) ควรเลือกมาตรฐานเดียว
2. **`getValueAtOrBefore` กับ history ห่าง**: baseline "vs 7 วันก่อน" จริง ๆ คือ "snapshot ล่าสุดที่อายุ ≥ 7 วัน" — ถ้าอัปเดตเดือนละครั้ง ตัวเลขคือ "vs 1 เดือนก่อน" แต่ label ทุกใบบอก 7 วัน/period — เป็น approximation ที่ควรตัดสินใจว่า acceptable ไหม (กระทบ KPI delta, Radar previous, RoiHeadline)
3. **แกน X ของ Forecast เป็น category**: `XAxis dataKey="label"` ไม่ใช่ time scale — history ที่บันทึกห่างไม่เท่ากัน (เช่น 1 เดือน, 2 วัน, 1 วัน) ถูกวาดระยะเท่ากันหมด ขณะเส้น regression คำนวณบนเวลาจริง → รูปเส้นบนจอกับ slope จริงไม่สอดคล้องกันเชิงสายตา
4. **double filter `isVisible`**: route ส่ง `onlyVisible: !ctx.canManage` (server) + `HistoryContext` filter ซ้ำ (client) — ผลคือ admin/seo เห็นกราฟแบบ filtered เหมือนลูกค้า (น่าจะ intended) แต่ rule 11 ข้อ 4 เขียนว่าห้าม filter ซ้ำซ้อนหลายชั้น — ควร confirm เจตนาแล้วบันทึกใน rule/โค้ดให้ตรงกัน
5. **`useGetCombinedHistory` staleTime 5 นาที**: จุด "วันนี้" (synthetic) ค้างได้ 5 นาทีหลัง admin แก้ข้อมูล ขณะ `useGetCustomerReport` (ไม่มี staleTime) refetch ไวกว่า → การ์ดที่ใช้ live prop กับกราฟที่ใช้ context อาจโชว์เลขต่างกันชั่วขณะ — เป็นผลพวงของ L3/L4
6. **`computeRoiHeadline` เมื่อ `previousTraffic = 0`**: ถือว่าไม่มี baseline (`> 0` ที่ `kpis.ts:153`) — ถ้าเว็บเริ่มจาก traffic 0 จริง การโตเป็น 500 จะไม่ถูกเล่าใน Hero เลย (แสดง "—") — ตัดสินใจเชิง product ว่าอยากเล่าเคส "จาก 0" อย่างไร

---

## 5. ตรวจแล้วถูกต้อง (ยืนยัน logic ผ่าน trace แล้ว)

**`_shared.ts`** — `sortByDateAsc/Desc`, `clamp`, `isRanked`, `getValueAtOrBefore` (สมมติฐาน desc ตรงกับข้อมูลจริงจาก repo + synthetic prepend), `latestRecordByKeywordBeforeCutoff` (desc → record แรกต่อ keyword = ล่าสุดก่อน cutoff ✓), `toWeekStart`/`buildWeekStarts` (local time, ISO Monday ✓)

**`trends.ts`** — `calculatePercentageChange` (กัน previous=0 → Infinity → "new"), `determineTrend`, `calculateTrafficChange` (per-keyword, ไม่มี synthetic ใน keywordHistory จึงไม่โดน C1; semantics "vs snapshot ล่าสุด" ชัดเจน)

**`kpis.ts`** — `computeDelta` (กันหารศูนย์ → pct null ✓), `buildSparkline` (desc → reverse → slice ท้าย ✓), `computeAvgPosition` (กรอง > 0 ✓), `computeRoiHeadline` โครงหลัก (currentTraffic จาก `metricsHistory[0]` = synthetic = ตาม rule 11 ✓, threshold ±0.5% ✓) — ยกเว้นส่วนที่พึ่ง `computeTopMovers` (H2)

**`distribution.ts`** — `bucketForPosition`/`computePositionDistribution` (≤ 0 → unranked ✓), `bracketForPos` (≤ 0 → missing ✓), โครง `computeBracketTransitions` (หา fromPos ล่าสุดก่อน cutoff จาก asc แล้ว break ✓, นับ/รวม link ✓)

**`authority.ts`** — ทั้งไฟล์: `normalizeToScore100` (log10 ✓ กัน ≤ 0), `trustFromSpam` (clamp ✓), `computeAuthorityRadar` คณิตถูก (ประเด็นเดียวคือแหล่ง current — L3), `computeDomainPhase` (ขอบ 12/36 เดือน + progress ถูก), `computeBacklinkRatio` (refDomains ≤ 0 → null ✓)

**`keyword-performance.ts`** — `computeKdSuccessRate` (กรอง `position > 0` ✓ — ต่างจาก H1!), `computeTrafficContribution` (total = 0 → [] กัน NaN ✓, Other rollup % ถูก), `groupKeywordsByKd` (ยกเว้น L7)

**`charts.ts`** — `filterHistoryByPeriod` (cutoff + asc ✓), `deduplicateByDay` (**local** day ✓ — ตัวที่ M1/M2 ควรเลียนแบบ), `downsampleWide` (stride + เก็บจุดสุดท้าย ✓), `computeAiOverviewWeeklyCounts` (bucket index ✓ ตัดอนาคต/ก่อนช่วง ✓), `computeKeywordHeatmap` (กรอง `isRanked` แล้วตาม ccd79a9 ✓, ทับด้วย record ล่าสุดในสัปดาห์ ✓, เติม current เฉพาะสัปดาห์สุดท้ายที่ว่าง ✓)

**`forecast.ts`** — สูตร regression หลัก: slope/intercept (least squares ✓), `den === 0 → slope 0`, residualStd ด้วย df = n−2 ✓, R² gating (`n < 3 || ssTot === 0 → null` ✓ ป้องกัน R²=1 หลอกที่ n=2), bridge point ทำเส้นต่อเนื่อง ✓, `changePct` anchor = จุด history ล่าสุด (= synthetic current ตาม rule 11 ✓), `Math.max(0, pred)` กันค่าติดลบ ✓ — ที่เหลือคือ M1/M5/L2

**Components** — `GaugeChart` (clamp ที่ stroke แต่โชว์ค่าจริง ✓), `MiniSparkline` (range = 0 → หาร 1 กัน NaN ✓, invert ✓), `CustomLinearProgress` (clamp 100 ✓ — สเกล Age=เดือน/100 และ Spam=%/100 เป็น visual choice ไม่ใช่การคำนวณผิด), `AnomalyDot`/`ClippedDot` (อ่าน flag/เทียบ real vs clipped ✓), `SnapshotView` (กรอง pos ≤ 0 → '-' ✓)

**Widgets/sections ที่เหลือ** — `PositionDistribution` (สัดส่วน % จาก total ✓), `KeywordTrendChart`: `clampPosition` (≤ 0 → null gap ✓), tooltip โชว์ posReal ✓, `isSinglePoint` ✓, donut % ✓; `TrendChartsSection` (anomaly per-series บนแถว aligned — ไม่โดน M4 ✓, `offSeries.latest` = แถวท้าย asc = ใหม่สุด ✓, flatLine ✓); `SpamScoreTimeline`/`BacklinksVsRefDomains` (โครง dedupe/threshold/ratio ล่าสุดถูก — เว้น L5/L6); `BracketTransitionsSankey` layout (สัดส่วน px ต่อ count แบบ min สองฝั่ง ✓); `KdSuccessRateBar`/`KdDistributionDonut`/`TopKeywordsByTrafficPie` (ส่งต่อค่าจากฟังก์ชันที่ตรวจแล้ว ✓); `HeroStatusCard` (`formatPct` แสดงเครื่องหมายครบ ✓); `AiOverviewTimelineBar` (รวม/นับ ✓); `DomainLifecycleCard` (อายุไม่ใช่ time series — ใช้ prop ได้ ไม่ขัด rule 11); `AiOverviewCard`/`RecommendKeywordTable`/`WorkProgressTab` (ไม่มีการคำนวณตัวเลข)

**เส้นทางข้อมูล** — `getCustomerHistoryReport` (desc + synthetic isVisible:true ✓ keywordHistory ไม่มี synthetic — สอดคล้องที่ทุกสูตร keyword ใช้ `currentKeywords` เป็นจุด "now"), `HistoryContext` (filter เดียว ✓), `getCustomerReport` (sort top/other ✓ null position → ท้ายแถว ✓), `metrics/history/route.ts` (`onlyVisible: !ctx.canManage` ตาม rule 11 ✓), `buildChartConfig`/`chartConfig`/`utils` (mapping ล้วน ไม่มีคณิต)

---

*Audit โดย Claude Code — 2026-06-10 · อ้างอิงบรรทัดจากโค้ด ณ commit `c6b8cb1`*

*อัปเดต 2026-06-10: แก้ Medium ครบทั้ง 7 (M1–M7) — เพิ่ม helper `localDayKey()` ใน `_shared.ts` ใช้ร่วม forecast/kpis/KeywordTrendChart (M1/M2), leave-one-out z-score (M3), anomaly คิดเฉพาะแถวจริง (M4), prediction interval ขยายตาม horizon (M5), `lastUpdated` = record จริง (M6), sparkline `isRanked` + Avg Position `previous: null` (M7) · ผ่าน `npx tsc --noEmit` + `eslint` (0 errors)*

*อัปเดต 2026-06-10: แก้ Low ครบทั้ง 10 (L1–L10) — sign ติดลบ (L1), เส้น "วันนี้" = จุด actual ล่าสุด (L2), Radar อ่าน synthetic current จาก context (L3), converge keyword ทุกตัวมา `currentKeywords` รวมตาราง (L4), `ChartFallbackNote` แจ้ง fallback all-time × 3 กราฟ (L5), ratio null → เว้น gap (L6), KD total นับเฉพาะ valid (L7), legend heatmap 5 ระดับ (L8), empty-state Sankey ตรง logic (L9), sparkline delta ผูก period (L10) · ผ่าน `npx tsc --noEmit` + `npm run lint` (0 errors) + `prettier` · **audit ครบทุก finding (C1 / H1–H4 / M1–M7 / L1–L10) แก้หมดแล้ว***
