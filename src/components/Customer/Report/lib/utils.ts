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
 * ฟังก์ชันกำหนดสีสำหรับ Age
 * @param years - อายุของโดเมนในหน่วยปี
 * @returns สีที่ใช้แสดงในกราฟ
 */
export const getAgeColor = (years: number): string => {
  if (years > 2) return "#2e7d32"; // Green
  if (years >= 1) return "#ed6c02"; // Yellow
  return "#d32f2f"; // Red
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
