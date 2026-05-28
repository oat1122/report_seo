'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_PERIOD, type PeriodOption } from '../lib/chartConfig'

interface ReportFiltersValue {
  period: PeriodOption
  setPeriod: (p: PeriodOption) => void
}

const ReportFiltersContext = createContext<ReportFiltersValue | undefined>(undefined)

export const ReportFiltersProvider = ({
  children,
  initialPeriod = DEFAULT_PERIOD,
}: {
  children: ReactNode
  initialPeriod?: PeriodOption
}) => {
  const [period, setPeriodState] = useState<PeriodOption>(initialPeriod)
  const setPeriod = useCallback((p: PeriodOption) => setPeriodState(p), [])

  const value = useMemo<ReportFiltersValue>(() => ({ period, setPeriod }), [period, setPeriod])

  return <ReportFiltersContext.Provider value={value}>{children}</ReportFiltersContext.Provider>
}

// Hook ใช้ใน chart components — fallback to local state ถ้าไม่อยู่ใน provider
export const useReportFilters = (): ReportFiltersValue => {
  const ctx = useContext(ReportFiltersContext)
  if (!ctx) {
    return { period: DEFAULT_PERIOD, setPeriod: () => {} }
  }
  return ctx
}

// helper เช็คว่าอยู่ใน provider จริงไหม (เพื่อ decide ว่าจะ override ด้วย local หรือไม่)
export const useHasReportFilters = (): boolean => {
  return useContext(ReportFiltersContext) !== undefined
}
