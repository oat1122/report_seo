// src/components/Customer/Report/lib/utils.ts
import { KDLevel } from "@prisma/client";

/**
 * ฟังก์ชันกำหนดสีของ Chip ตาม KD Level
 * @param kd - ระดับความยาก (HARD, MEDIUM, EASY)
 * @returns สีที่ใช้แสดงใน MUI Chip component
 */
export const getKdColor = (
  kd: KDLevel
): "error" | "warning" | "success" | "default" => {
  switch (kd) {
    case KDLevel.HARD:
      return "error";
    case KDLevel.MEDIUM:
      return "warning";
    case KDLevel.EASY:
      return "success";
    default:
      return "default";
  }
};

/**
 * ฟังก์ชันกำหนดสีสำหรับ Domain Rating และ Health Score
 * @param value - ค่าของ metric
 * @returns สีที่ใช้แสดงในกราฟ
 */
export const getRatingColor = (value: number): string => {
  if (value > 40) return "#2e7d32"; // Dark Green
  if (value > 30) return "#66bb6a"; // Light Green
  if (value < 20) return "#ed6c02"; // Yellow (Warning)
  return "#1976d2"; // Default Blue
};

/**
 * ฟังก์ชันกำหนดสีสำหรับ Age (ใช้การคำนวณจากเดือนรวม)
 * @param years - อายุของโดเมนในหน่วยปี
 * @param months - อายุของโดเมนในหน่วยเดือน (0-11)
 * @returns สีที่ใช้แสดงในกราฟ
 */
export const getAgeColor = (years: number, months: number = 0): string => {
  const totalMonths = years * 12 + months;
  if (totalMonths > 24) return "#2e7d32"; // Green (> 2 years)
  if (totalMonths >= 12) return "#ed6c02"; // Yellow (1-2 years)
  return "#d32f2f"; // Red (< 1 year)
};

/**
 * ฟังก์ชันกำหนดสีสำหรับ Spam Score
 * @param score - ค่า Spam Score
 * @returns สีที่ใช้แสดงในกราฟ
 */
export const getSpamColor = (score: number): string => {
  if (score > 2) return "#d32f2f"; // Red
  return "#2e7d32"; // Green
};
