'use client'

import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Role } from '@/types/auth'
import { Input } from '@/components/ui/input'
import { motion } from '@/components/motion'
import { cn } from '@/lib/utils'

export type RoleFilterValue = 'ALL' | Role

interface RoleOption {
  value: RoleFilterValue
  label: string
  count: number
}

interface UserListToolbarProps {
  /** ไม่ส่ง = ไม่แสดงตัวกรองบทบาท */
  roleOptions?: RoleOption[]
  roleFilter?: RoleFilterValue
  onRoleFilterChange?: (value: RoleFilterValue) => void
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  /** control เพิ่มเติมก่อนช่องค้นหา เช่น สวิตช์ "แสดงที่ลบแล้ว" */
  extra?: ReactNode
}

/** แถบตัวกรองของหน้า list (Handoff 05): segmented บทบาท + ค้นหา */
export function UserListToolbar({
  roleOptions,
  roleFilter = 'ALL',
  onRoleFilterChange,
  search,
  onSearchChange,
  searchPlaceholder = 'ค้นหาชื่อ อีเมล หรือ domain...',
  extra,
}: UserListToolbarProps) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
      {roleOptions && onRoleFilterChange && (
        <div
          role="group"
          aria-label="กรองตามบทบาท"
          className="border-glass-border grid grid-cols-2 gap-1 rounded-[14px] border bg-white/60 p-1 sm:flex sm:self-start dark:bg-white/5"
        >
          {roleOptions.map((opt, i) => {
            const active = opt.value === roleFilter
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={active}
                onClick={() => onRoleFilterChange(opt.value)}
                className={cn(
                  'focus-visible:ring-ring/70 relative flex h-11 items-center justify-center gap-1.5 rounded-[10px] px-3 text-[13px] whitespace-nowrap outline-none focus-visible:ring-[3px] sm:h-9',
                  // "ทั้งหมด" กินเต็มแถวบนมือถือ (5 ตัวเลือกในกริด 2 คอลัมน์)
                  i === 0 && 'col-span-2 sm:col-span-1',
                  active
                    ? 'text-foreground font-medium'
                    : 'text-text-secondary hover:text-foreground',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="user-role-filter"
                    aria-hidden
                    className="absolute inset-0 rounded-[10px] bg-white shadow-[0_4px_12px_-6px_rgba(108,104,232,0.6)] dark:bg-white/10"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{opt.label}</span>
                <span className="text-text-secondary relative text-xs tabular-nums">
                  {opt.count.toLocaleString('th-TH')}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:ml-auto">
        {extra}
        <label className="relative block sm:w-[260px]">
          <span className="sr-only">{searchPlaceholder}</span>
          <Search
            aria-hidden
            className="text-text-secondary pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="border-glass-border rounded-[14px] bg-white/75 pl-10 dark:bg-white/5"
          />
        </label>
      </div>
    </div>
  )
}
