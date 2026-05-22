interface WeightedItem {
  weight: number;
  progressPercent: number;
}

// คำนวณ % รวมของแผนแบบถ่วงน้ำหนัก
// ถ้า weight ทั้งหมดเป็น 0 → คืน 0 (กัน division-by-zero)
export function calcOverallPercent(items: readonly WeightedItem[]): number {
  if (items.length === 0) return 0;
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  if (totalWeight === 0) return 0;
  const weighted = items.reduce(
    (sum, i) => sum + i.progressPercent * i.weight,
    0,
  );
  return Math.round(weighted / totalWeight);
}

interface CategorizedItem extends WeightedItem {
  categoryId: string;
}

export interface CategoryBreakdown {
  categoryId: string;
  overallPercent: number;
  itemCount: number;
}

// คำนวณ % รายหมวด — ใช้ใน getPlanSummary
export function calcByCategory(
  items: readonly CategorizedItem[],
): CategoryBreakdown[] {
  const buckets = new Map<string, CategorizedItem[]>();
  for (const item of items) {
    const bucket = buckets.get(item.categoryId) ?? [];
    bucket.push(item);
    buckets.set(item.categoryId, bucket);
  }
  return Array.from(buckets.entries()).map(([categoryId, group]) => ({
    categoryId,
    overallPercent: calcOverallPercent(group),
    itemCount: group.length,
  }));
}
