import type { ChartConfig } from "@/components/ui/chart";

interface ChartConfigItem {
  key: string;
  label: string;
  color: string;
}

/**
 * Helper สร้าง ChartConfig ของ shadcn จากรายการ series
 * - shadcn ChartContainer จะ inject CSS var `--color-<key>` จาก field `color`
 * - ใน recharts ใช้ `stroke="var(--color-<key>)"`, `fill="var(--color-<key>)"`
 */
export const buildChartConfig = (items: ChartConfigItem[]): ChartConfig =>
  items.reduce<ChartConfig>((acc, { key, label, color }) => {
    acc[key] = { label, color };
    return acc;
  }, {});
