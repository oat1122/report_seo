// src/components/Customer/Report/lib/utils.ts
import { KdLevel } from "@/types/kd";

export const getKdColor = (
  kd: KdLevel,
): "error" | "warning" | "success" | "default" => {
  switch (kd) {
    case KdLevel.HARD:
      return "error";
    case KdLevel.MEDIUM:
      return "warning";
    case KdLevel.EASY:
      return "success";
    default:
      return "default";
  }
};

// Returns CSS var() references — mirror จาก src/theme/theme.ts ผ่าน globals.css
// ใช้กับ style={{ color: getXxxColor(value) }} หรือใส่ใน background

/** Domain Rating / Health Score color */
export const getRatingColor = (value: number): string => {
  if (value > 30) return "var(--success)";
  if (value < 20) return "var(--warning)";
  return "var(--info)";
};

/** Age color — ตามอายุโดเมน */
export const getAgeColor = (years: number, months: number = 0): string => {
  const totalMonths = years * 12 + months;
  if (totalMonths > 24) return "var(--success)";
  if (totalMonths >= 12) return "var(--warning)";
  return "var(--destructive)";
};

/** Spam Score color */
export const getSpamColor = (score: number): string => {
  if (score > 2) return "var(--destructive)";
  return "var(--success)";
};
