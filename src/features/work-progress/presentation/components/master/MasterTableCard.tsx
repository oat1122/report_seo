'use client'

import type { ReactNode } from 'react'
import { Eye, EyeOff, Loader2, Pencil, Plus } from 'lucide-react'
import { AnimatePresence, EASE_OUT, motion } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface MasterListRow {
  id: string
  code: string
  name: string
  color: string | null
  orderIndex: number
  isActive: boolean
  isSystem: boolean
}

interface MasterTableCardProps<T extends MasterListRow> {
  headingId: string
  title: string
  description: string
  addLabel: string
  emptyText: string
  rows: T[]
  isLoading: boolean
  isError: boolean
  pendingId: string | null
  onRetry: () => void
  onAdd: () => void
  onEdit: (row: T) => void
  onDeactivate: (row: T) => void
  onReactivate: (row: T) => void
  /** badge เพิ่มเติมท้ายชื่อ เช่น Default / Terminal ของสถานะ */
  renderFlags?: (row: T) => ReactNode
}

const rowMotion = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: { duration: 0.25, ease: EASE_OUT },
} as const

export function MasterTableCard<T extends MasterListRow>({
  headingId,
  title,
  description,
  addLabel,
  emptyText,
  rows,
  isLoading,
  isError,
  pendingId,
  onRetry,
  onAdd,
  onEdit,
  onDeactivate,
  onReactivate,
  renderFlags,
}: MasterTableCardProps<T>) {
  const actionProps = { pendingId, onEdit, onDeactivate, onReactivate }

  return (
    <section
      aria-labelledby={headingId}
      className="border-glass-border bg-glass-card shadow-card @container flex min-w-0 flex-col gap-4 rounded-[20px] border p-4 backdrop-blur-md sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 id={headingId} className="text-[17px] font-semibold">
            {title}
          </h2>
          <p className="text-text-secondary text-[13px]">{description}</p>
        </div>
        <Button variant="soft" onClick={onAdd} className="gap-2 sm:h-10">
          <Plus className="size-4" aria-hidden />
          {addLabel}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2" role="status">
          <span className="sr-only">กำลังโหลด{title}</span>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="border-border flex flex-col items-start gap-3 rounded-2xl border border-dashed p-5"
        >
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">โหลดรายการไม่สำเร็จ</p>
            <p className="text-text-secondary text-[13px]">
              ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต แล้วกด “ลองอีกครั้ง”
            </p>
          </div>
          <Button variant="outline" onClick={onRetry}>
            ลองอีกครั้ง
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="border-border flex flex-col items-center gap-1 rounded-2xl border border-dashed px-5 py-10 text-center">
          <p className="text-sm font-medium">{emptyText}</p>
          <p className="text-text-secondary text-[13px]">กด “{addLabel}” เพื่อสร้างรายการแรก</p>
        </div>
      ) : (
        <>
          {/* ≥ 448px ของการ์ด: ตาราง */}
          <table className="hidden w-full table-fixed border-collapse @md:table">
            <caption className="sr-only">{title}</caption>
            <colgroup>
              <col className="w-16" />
              <col />
              <col className="w-[92px]" />
              <col className="w-[108px]" />
            </colgroup>
            <thead>
              <tr className="border-border border-b">
                <th
                  scope="col"
                  className="text-text-secondary px-3.5 py-3 text-left text-xs font-medium"
                >
                  ลำดับ
                </th>
                <th
                  scope="col"
                  className="text-text-secondary px-3.5 py-3 text-left text-xs font-medium"
                >
                  ชื่อ
                </th>
                <th
                  scope="col"
                  className="text-text-secondary px-3.5 py-3 text-left text-xs font-medium"
                >
                  สถานะ
                </th>
                <th scope="col" className="px-3.5 py-3">
                  <span className="sr-only">การจัดการ</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    layout="position"
                    {...rowMotion}
                    className="border-border/80 border-b last:border-b-0"
                  >
                    <td className="text-text-secondary px-3.5 py-3 align-middle text-[13px] tabular-nums">
                      {row.orderIndex}
                    </td>
                    <td className="px-3.5 py-3 align-middle">
                      <MasterName row={row} flags={renderFlags?.(row)} />
                    </td>
                    <td className="px-3.5 py-3 align-middle">
                      <ActiveBadge active={row.isActive} />
                    </td>
                    <td className="px-3.5 py-3 align-middle">
                      <RowActions row={row} compact {...actionProps} />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {/* การ์ดแคบ / มือถือ: รายการแบบการ์ด */}
          <ul className="flex flex-col gap-2 @md:hidden" aria-label={title}>
            <AnimatePresence initial={false}>
              {rows.map((row) => (
                <motion.li
                  key={row.id}
                  layout="position"
                  {...rowMotion}
                  className="border-glass-border bg-glass-tile flex items-center gap-3 rounded-2xl border p-3"
                >
                  <span className="text-text-secondary w-6 shrink-0 text-center text-[13px] tabular-nums">
                    {row.orderIndex}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <MasterName row={row} flags={renderFlags?.(row)} />
                    <ActiveBadge active={row.isActive} />
                  </div>
                  <RowActions row={row} {...actionProps} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}
    </section>
  )
}

function MasterName({ row, flags }: { row: MasterListRow; flags?: ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden
        className={cn(
          'border-foreground/10 size-3 shrink-0 rounded-[4px] border',
          !row.isActive && 'opacity-50',
        )}
        style={{ backgroundColor: row.color ?? 'var(--muted)' }}
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span
          className={cn(
            'flex flex-wrap items-center gap-1.5 text-sm font-medium break-words',
            !row.isActive && 'text-text-secondary',
          )}
        >
          {row.name}
          {flags}
          {row.isSystem && (
            <Badge variant="outline" className="text-text-secondary">
              system
            </Badge>
          )}
        </span>
        <span className="text-text-secondary truncate font-mono text-[11px]">{row.code}</span>
      </div>
    </div>
  )
}

function ActiveBadge({ active }: { active: boolean }) {
  return active ? <Badge variant="success">เปิดใช้</Badge> : <Badge variant="neutral">ปิด</Badge>
}

interface RowActionsProps<T extends MasterListRow> {
  row: T
  compact?: boolean
  pendingId: string | null
  onEdit: (row: T) => void
  onDeactivate: (row: T) => void
  onReactivate: (row: T) => void
}

function RowActions<T extends MasterListRow>({
  row,
  compact,
  pendingId,
  onEdit,
  onDeactivate,
  onReactivate,
}: RowActionsProps<T>) {
  const pending = pendingId === row.id
  const size = compact ? ('icon-sm' as const) : ('icon' as const)
  const spinner = <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />

  return (
    <div className="flex shrink-0 justify-end gap-1.5">
      <Button
        variant="outline"
        size={size}
        onClick={() => onEdit(row)}
        aria-label={`แก้ไข ${row.name}`}
        title="แก้ไข"
      >
        <Pencil className="size-4" aria-hidden />
      </Button>
      {row.isActive && !row.isSystem && (
        <Button
          variant="outline"
          size={size}
          onClick={() => onDeactivate(row)}
          disabled={pending}
          aria-busy={pending}
          aria-label={`ปิดใช้งาน ${row.name}`}
          title="ปิดใช้งาน"
        >
          {pending ? spinner : <EyeOff className="size-4" aria-hidden />}
        </Button>
      )}
      {!row.isActive && (
        <Button
          variant="outline"
          size={size}
          onClick={() => onReactivate(row)}
          disabled={pending}
          aria-busy={pending}
          aria-label={`เปิดใช้งาน ${row.name} อีกครั้ง`}
          title="เปิดใช้งานอีกครั้ง"
        >
          {pending ? spinner : <Eye className="size-4" aria-hidden />}
        </Button>
      )}
    </div>
  )
}
