'use client'

import { useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useGetSeoDevs } from '@/features/users/presentation/hooks/useUsers'
import { useAssignItem } from '../../hooks/useItemMutations'

interface AssignItemPopoverProps {
  userId: string
  planId: string
  itemId: string
  currentAssigneeId: string | null
  // ชื่อผู้รับผิดชอบจาก payload — ใช้แสดงตอน readOnly โดยไม่ต้อง fetch รายชื่อ staff (403 สำหรับลูกค้า)
  currentAssigneeName?: string | null
  readOnly?: boolean
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
}

function AssigneeTile({
  name,
  subtitle,
  children,
}: {
  name: string | null
  subtitle: string
  children?: React.ReactNode
}) {
  return (
    <div className="border-border flex items-center gap-3 rounded-[14px] border bg-white/70 px-3 py-2.5 dark:bg-white/5">
      <span
        aria-hidden
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-white text-[13px] font-semibold dark:border-white/20',
          name ? 'bg-info-subtle text-foreground' : 'bg-muted text-text-secondary',
        )}
      >
        {name ? initials(name) : '—'}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{name ?? 'ยังไม่ได้กำหนด'}</span>
        <span className="text-text-secondary text-xs">{subtitle}</span>
      </span>
      {children}
    </div>
  )
}

export function AssignItemPopover({
  userId,
  planId,
  itemId,
  currentAssigneeId,
  currentAssigneeName,
  readOnly,
}: AssignItemPopoverProps) {
  // ลูกค้า (readOnly) ไม่มีสิทธิ์เรียก /users/seodevs → ปิด query ไว้ ใช้ชื่อจาก payload แทน
  const { data: seoDevs, isLoading } = useGetSeoDevs(!readOnly)
  const assignMut = useAssignItem()
  const [open, setOpen] = useState(false)

  const current = useMemo(
    () => (seoDevs ?? []).find((u) => u.id === currentAssigneeId),
    [seoDevs, currentAssigneeId],
  )

  const handleSelect = async (assigneeId: string | null) => {
    setOpen(false)
    await assignMut.mutateAsync({
      userId,
      planId,
      itemId,
      body: { assignedToId: assigneeId },
    })
  }

  if (readOnly) {
    return <AssigneeTile name={currentAssigneeName ?? null} subtitle="ผู้รับผิดชอบงานนี้" />
  }

  const displayName = current ? (current.name ?? current.email) : (currentAssigneeName ?? null)

  return (
    <AssigneeTile name={displayName} subtitle={displayName ? 'SEO Dev' : 'เลือกผู้ดูแลจากทีม SEO'}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading || assignMut.isPending}
            aria-label={
              displayName ? `เปลี่ยนผู้รับผิดชอบ (ตอนนี้: ${displayName})` : 'กำหนดผู้รับผิดชอบ'
            }
          >
            {assignMut.isPending ? 'กำลังบันทึก...' : displayName ? 'เปลี่ยน' : 'กำหนด'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="end">
          <Command>
            <CommandInput placeholder="ค้นหา SEO Dev..." />
            <CommandList>
              <CommandEmpty>ไม่พบผู้รับผิดชอบ</CommandEmpty>
              <CommandGroup>
                {currentAssigneeId && (
                  <CommandItem onSelect={() => handleSelect(null)}>
                    <X className="size-4" />
                    ยกเลิกการกำหนด
                  </CommandItem>
                )}
                {(seoDevs ?? []).map((u) => (
                  <CommandItem key={u.id} onSelect={() => handleSelect(u.id)}>
                    <Check
                      className={cn(
                        'size-4',
                        currentAssigneeId === u.id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="flex-1 truncate">{u.name ?? u.email}</span>
                    {u.name && <span className="text-text-secondary text-xs">{u.email}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </AssigneeTile>
  )
}
