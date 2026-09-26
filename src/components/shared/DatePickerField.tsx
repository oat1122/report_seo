'use client'

import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Props {
  // ค่าเป็นรูปแบบ 'YYYY-MM-DD' (หรือ '' เมื่อยังไม่เลือก) เพื่อให้ส่งเข้า API ได้ตรงกับเดิม
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
  disabled?: boolean
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function DatePickerField({
  value,
  onChange,
  placeholder = 'เลือกวันที่',
  id,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false)
  const selected = parseDate(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-between bg-white px-3 font-normal tabular-nums dark:bg-white/5',
            !selected && 'text-muted-foreground',
          )}
        >
          {/* วันที่ ค.ศ. ตาม Handoff 04 ข้อ 8 เช่น 28 ก.ย. 2026 */}
          {selected
            ? selected.toLocaleDateString('th-TH-u-ca-gregory', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : placeholder}
          <CalendarIcon aria-hidden className="text-text-secondary size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            onChange(date ? toIsoDate(date) : '')
            setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
