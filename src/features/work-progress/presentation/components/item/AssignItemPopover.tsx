'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown, User, X } from 'lucide-react'
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
  readOnly?: boolean
}

export function AssignItemPopover({
  userId,
  planId,
  itemId,
  currentAssigneeId,
  readOnly,
}: AssignItemPopoverProps) {
  const { data: seoDevs, isLoading } = useGetSeoDevs()
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
    return (
      <span className="text-sm">{current ? (current.name ?? current.email) : 'ไม่ได้กำหนด'}</span>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('justify-between gap-2', !current && 'text-muted-foreground')}
          disabled={isLoading || assignMut.isPending}
        >
          <span className="flex items-center gap-2">
            <User className="size-4" />
            {current ? (current.name ?? current.email) : 'ไม่ได้กำหนด'}
          </span>
          <ChevronsUpDown className="size-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="ค้นหา SEO_DEV..." />
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
                  {u.name && <span className="text-muted-foreground text-xs">{u.email}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
