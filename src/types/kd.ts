export const KdLevel = {
  HARD: "HARD",
  MEDIUM: "MEDIUM",
  EASY: "EASY",
} as const;

export type KdLevel = (typeof KdLevel)[keyof typeof KdLevel];

export const KD_LEVELS: readonly KdLevel[] = [
  KdLevel.HARD,
  KdLevel.MEDIUM,
  KdLevel.EASY,
];
