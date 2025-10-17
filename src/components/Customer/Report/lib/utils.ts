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
