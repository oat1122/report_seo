interface WeightedItem {
  weight: number
  progressPercent: number
}

// คำนวณ % รวมของแผนแบบถ่วงน้ำหนัก
// ถ้า weight ทั้งหมดเป็น 0 → คืน 0 (กัน division-by-zero)
export function calcOverallPercent(items: readonly WeightedItem[]): number {
  if (items.length === 0) return 0
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0)
  if (totalWeight === 0) return 0
  const weighted = items.reduce((sum, i) => sum + i.progressPercent * i.weight, 0)
  return Math.round(weighted / totalWeight)
}

interface ItemProgressSignals {
  status: { isTerminal: boolean }
  subtasks: ReadonlyArray<{ isDone: boolean }>
}

// % ของ item — ตรงกับช่องในตาราง (subtaskPercent ของ PlanGridRow)
//   - มี subtasks → done/total
//   - ไม่มี subtasks → terminal ? 100 : 0
export function getEffectiveItemPercent(item: ItemProgressSignals): number {
  if (item.subtasks.length > 0) {
    const done = item.subtasks.filter((s) => s.isDone).length
    return Math.round((done / item.subtasks.length) * 100)
  }
  return item.status.isTerminal ? 100 : 0
}

// นับเป็น "เสร็จแล้ว" ต่อเมื่อ status terminal และ subtasks ครบทุกตัว
// (ถ้าไม่มี subtasks → ใช้ status terminal อย่างเดียว)
export function isItemCompleted(item: ItemProgressSignals): boolean {
  if (!item.status.isTerminal) return false
  return item.subtasks.every((s) => s.isDone)
}

interface WeightedProgressItem extends ItemProgressSignals {
  weight: number
}

// % รวมของแผนแบบถ่วงน้ำหนัก โดย derive % ต่อ item จาก signals ที่ FE ใช้
// ใช้ตัวนี้แทน calcOverallPercent สำหรับ UI ที่ต้องตรงกับช่องในตาราง
export function calcPlanOverallPercent(items: readonly WeightedProgressItem[]): number {
  if (items.length === 0) return 0
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0)
  if (totalWeight === 0) return 0
  const weighted = items.reduce((sum, i) => sum + getEffectiveItemPercent(i) * i.weight, 0)
  return Math.round(weighted / totalWeight)
}

interface CategorizedItem extends WeightedItem {
  categoryId: string
}

export interface CategoryBreakdown {
  categoryId: string
  overallPercent: number
  itemCount: number
}

// คำนวณ % รายหมวด — ใช้ใน getPlanSummary
export function calcByCategory(items: readonly CategorizedItem[]): CategoryBreakdown[] {
  const buckets = new Map<string, CategorizedItem[]>()
  for (const item of items) {
    const bucket = buckets.get(item.categoryId) ?? []
    bucket.push(item)
    buckets.set(item.categoryId, bucket)
  }
  return Array.from(buckets.entries()).map(([categoryId, group]) => ({
    categoryId,
    overallPercent: calcOverallPercent(group),
    itemCount: group.length,
  }))
}
