'use client'

import { useState, useDeferredValue } from 'react'
import { ChevronsUpDown, X, Loader2 } from 'lucide-react'
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
import { useCustomerSearch } from '../../hooks/useCustomerSearch'
import type { CustomerForDocument } from '../../../application/ports/BillingDocumentRepository'

interface Props {
  selected: CustomerForDocument | null
  onSelect: (customer: CustomerForDocument | null) => void
}

export function CustomerSearchCombobox({ selected, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const { data: customers = [], isLoading } = useCustomerSearch(deferredSearch)

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {selected ? (
              <span className="truncate">
                {selected.name} <span className="text-muted-foreground">({selected.domain})</span>
              </span>
            ) : (
              <span className="text-muted-foreground">ค้นหาลูกค้า...</span>
            )}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="พิมพ์ชื่อหรือ domain..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {isLoading && deferredSearch.length >= 1 ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="text-muted-foreground size-4 animate-spin" />
                </div>
              ) : customers.length === 0 && deferredSearch.length >= 1 ? (
                <CommandEmpty>ไม่พบลูกค้า</CommandEmpty>
              ) : (
                <CommandGroup>
                  {customers.map((c) => (
                    <CommandItem
                      key={c.id}
                      value={c.id}
                      onSelect={() => {
                        onSelect(c)
                        setOpen(false)
                        setSearch('')
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {c.domain}
                          {c.contactName && ` · ${c.contactName}`}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected && (
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => onSelect(null)}>
          <X className="size-4" />
        </Button>
      )}
    </div>
  )
}
