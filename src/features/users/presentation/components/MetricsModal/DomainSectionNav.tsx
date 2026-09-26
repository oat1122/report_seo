'use client'

import { EASE_OUT, GrowBar, motion } from '@/components/motion'
import { cn } from '@/lib/utils'

export type DomainSection = 'overview' | 'metrics' | 'keywords' | 'recommend' | 'next-steps' | 'ai'

export interface DomainNavItem {
  key: DomainSection
  label: string
  /** จำนวนรายการ — ส่งเฉพาะหมวดที่โหลดข้อมูลมาแล้วในหน้านี้ */
  count?: number
  /** มีค่าที่แก้แล้วยังไม่บันทึก */
  dirty?: boolean
}

interface DomainSectionNavProps {
  items: DomainNavItem[]
  active: DomainSection
  onSelect: (section: DomainSection) => void
  /** % ช่องค่าโดเมนที่กรอกแล้ว */
  completeness: number
  missingLabels: string[]
}

/** เมนูหมวดข้อมูล — desktop (xl) เป็นคอลัมน์ 240px ติดซ้าย · จอเล็กกว่าเป็น grid ด้านบน (rule 7) */
export function DomainSectionNav({
  items,
  active,
  onSelect,
  completeness,
  missingLabels,
}: DomainSectionNavProps) {
  return (
    <nav
      aria-label="หมวดข้อมูล"
      className="bg-glass-card border-glass-border shadow-card flex flex-col gap-1 rounded-[20px] border p-3.5 backdrop-blur-[14px] xl:sticky xl:top-6"
    >
      <span className="text-muted-foreground px-2.5 pt-1 pb-2 text-[11px] tracking-[0.12em] uppercase">
        หมวดข้อมูล
      </span>

      <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 xl:grid-cols-1">
        {items.map(({ key, label, count, dirty }) => {
          const isActive = key === active
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onSelect(key)}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'focus-visible:ring-ring/70 relative flex h-11 w-full items-center justify-between gap-2 rounded-xl px-3 text-sm transition-colors outline-none focus-visible:ring-[3px]',
                  isActive
                    ? 'text-primary-foreground font-medium'
                    : 'text-foreground hover:bg-white/60 dark:hover:bg-white/5',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="domain-section-pill"
                    aria-hidden
                    className="bg-primary absolute inset-0 rounded-xl"
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                  />
                )}
                <span className="relative truncate text-left">{label}</span>
                <span className="relative flex shrink-0 items-center gap-1.5">
                  {dirty && (
                    <>
                      <span aria-hidden className="bg-warning-accent size-2 rounded-full" />
                      <span className="sr-only">มีการแก้ไขที่ยังไม่บันทึก</span>
                    </>
                  )}
                  {count !== undefined && (
                    <span
                      className={cn(
                        'inline-flex h-5 min-w-[22px] items-center justify-center rounded-full px-1.5 text-[11px] tabular-nums',
                        isActive
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-info-subtle text-foreground',
                      )}
                    >
                      {count}
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="bg-glass-tile mt-3 flex flex-col gap-2 rounded-xl p-3">
        <div className="flex justify-between text-[13px]">
          <span id="domain-completeness-label">ความครบถ้วน</span>
          <strong className="font-semibold tabular-nums">{completeness}%</strong>
        </div>
        <div
          role="progressbar"
          aria-labelledby="domain-completeness-label"
          aria-valuenow={completeness}
          aria-valuemin={0}
          aria-valuemax={100}
          className="bg-info-subtle h-2 overflow-hidden rounded-full"
        >
          <GrowBar value={completeness} className="bg-info-strong h-full rounded-full" />
        </div>
        <span className="text-text-secondary text-xs">
          {missingLabels.length > 0
            ? `ยังขาด: ${missingLabels.join(', ')}`
            : 'กรอกค่าโดเมนครบทุกช่องแล้ว'}
        </span>
      </div>
    </nav>
  )
}
