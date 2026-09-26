'use client'

import { useState, useDeferredValue } from 'react'
import { ChevronsUpDown, Loader2, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useCustomerSearch } from '../../hooks/useCustomerSearch'
import type { CustomerForDocument } from '../../../application/ports/BillingDocumentRepository'

interface Props {
  selected: CustomerForDocument | null
  onSelect: (customer: CustomerForDocument | null) => void
  /** id ให้ label ภายนอกผูกกับปุ่มเปิดค้นหา */
  id?: string
}

export function CustomerSearchCombobox({ selected, onSelect, id }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const { data: customers = [], isLoading } = useCustomerSearch(deferredSearch, open)

  return (
    <div className="flex items-center gap-2">
      <Button
        id={id}
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="h-11 w-full min-w-0 justify-start gap-2 bg-white px-3 font-normal dark:bg-white/5"
      >
        <Search aria-hidden className="text-text-secondary" />
        {selected ? (
          <span className="bg-info-subtle inline-flex min-w-0 items-center gap-1.5 rounded-full py-0.5 pr-2.5 pl-1 text-[13px] font-medium">
            <span
              aria-hidden
              className="bg-info-subtle flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold dark:border-white/20"
            >
              {selected.name.trim().charAt(0).toUpperCase()}
            </span>
            <span className="truncate">
              {selected.name} · {selected.domain}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground truncate">
            พิมพ์ชื่อหรือ domain เพื่อเลือกลูกค้า...
          </span>
        )}
        <ChevronsUpDown aria-hidden className="text-text-secondary ml-auto size-4 shrink-0" />
      </Button>
      {selected && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="ล้างลูกค้าที่เลือก"
          onClick={() => onSelect(null)}
        >
          <X aria-hidden />
        </Button>
      )}

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="ค้นหาลูกค้า"
        description="เลือกลูกค้าจากระบบ — พิมพ์เพื่อกรองรายชื่อ"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="พิมพ์ชื่อหรือ domain เพื่อกรอง..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6" role="status">
                <Loader2 aria-hidden className="text-text-secondary size-4 animate-spin" />
                <span className="sr-only">กำลังค้นหาลูกค้า</span>
              </div>
            ) : customers.length === 0 ? (
              <CommandEmpty>ไม่พบลูกค้า ลองพิมพ์ชื่อหรือ domain อื่น</CommandEmpty>
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
                    <span
                      aria-hidden
                      className="bg-info-subtle flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                    >
                      {c.name.trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">{c.name}</span>
                      <span className="text-text-secondary truncate text-xs">
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
      </CommandDialog>
    </div>
  )
}
