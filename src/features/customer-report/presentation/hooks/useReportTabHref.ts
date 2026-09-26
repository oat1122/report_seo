'use client'

import { useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export type ReportTab = 'overview' | 'health' | 'keywords' | 'ai' | 'work-progress'

export const REPORT_TABS: readonly ReportTab[] = [
  'overview',
  'health',
  'keywords',
  'ai',
  'work-progress',
] as const

export const isReportTab = (value: string | null): value is ReportTab =>
  value !== null && (REPORT_TABS as readonly string[]).includes(value)

/** href ของแท็บในหน้ารายงานเดียวกัน — คง query อื่นไว้ เปลี่ยนแค่ ?tab= (ใช้กับ <Link replace>) */
export const useReportTabHref = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return useCallback(
    (tab: ReportTab) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', tab)
      return `${pathname}?${params.toString()}`
    },
    [pathname, searchParams],
  )
}
