/**
 * Calculate total months from years and months
 */
export const calculateTotalMonths = (
  years: number,
  months: number,
): number => {
  return years * 12 + months;
};

/**
 * Format duration for display (hides zero values)
 * @returns "2 ปี 6 เดือน", "5 เดือน", "2 ปี", or "-"
 */
export const formatDuration = (years: number, months: number): string => {
  if (!years && !months) return "-";
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ปี`);
  if (months > 0) parts.push(`${months} เดือน`);
  return parts.join(" ");
};
