import type { KdLevel } from '@/types/kd'

const KD_LABELS: Record<KdLevel, string> = {
  EASY: 'ง่าย',
  MEDIUM: 'ปานกลาง',
  HARD: 'ยาก',
}

export function kdLabel(kd: KdLevel | null): string {
  return kd ? KD_LABELS[kd] : '-'
}

export function formatThaiDate(date: Date): string {
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatNumber(value: number): string {
  return value.toLocaleString('th-TH')
}
