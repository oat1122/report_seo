import type { PeriodTypeCode } from "../types";

const THAI_MONTHS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
] as const;

export interface PeriodSeed {
  seq: number;
  label: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CustomPeriodInput {
  label: string;
  startDate?: Date;
  endDate?: Date;
}

// Generate periods ตามประเภทแผน — pure function (ไม่อ่าน Date.now)
export function generatePeriods(
  type: PeriodTypeCode,
  options: { year?: number; customPeriods?: readonly CustomPeriodInput[] } = {},
): PeriodSeed[] {
  switch (type) {
    case "YEAR_12_MONTHS":
      return THAI_MONTHS.map((label, i) => ({
        seq: i + 1,
        label,
        startDate: options.year ? new Date(options.year, i, 1) : undefined,
        // วันสุดท้ายของเดือน = day 0 ของเดือนถัดไป
        endDate: options.year ? new Date(options.year, i + 1, 0) : undefined,
      }));
    case "YEAR_4_QUARTERS":
      return [1, 2, 3, 4].map((q) => ({
        seq: q,
        label: `Q${q}`,
        startDate: options.year
          ? new Date(options.year, (q - 1) * 3, 1)
          : undefined,
        endDate: options.year ? new Date(options.year, q * 3, 0) : undefined,
      }));
    case "HALF_2_PERIODS":
      return [1, 2].map((h) => ({
        seq: h,
        label: `H${h}`,
        startDate: options.year
          ? new Date(options.year, (h - 1) * 6, 1)
          : undefined,
        endDate: options.year ? new Date(options.year, h * 6, 0) : undefined,
      }));
    case "CUSTOM":
      return (options.customPeriods ?? []).map((p, i) => ({
        seq: i + 1,
        label: p.label,
        startDate: p.startDate,
        endDate: p.endDate,
      }));
  }
}
