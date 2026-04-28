import { KdLevel } from "@/types/kd";

export function isKdLevel(value: unknown): value is KdLevel {
  return value === "HARD" || value === "MEDIUM" || value === "EASY";
}
