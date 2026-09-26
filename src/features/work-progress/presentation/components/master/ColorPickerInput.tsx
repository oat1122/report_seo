'use client'

import { useId } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ColorPickerInputProps {
  value: string | null | undefined
  onChange: (next: string | null) => void
  className?: string
  disabled?: boolean
  /** id ของข้อความ label ที่ใช้ตั้งชื่อกลุ่มสี */
  labelId?: string
  invalid?: boolean
  describedBy?: string
}

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/

// ค่าสีที่ "บันทึกลงฐานข้อมูล" (schema บังคับ #rrggbb) ไม่ใช่สไตล์ของ component
// เลือกให้ตรงกับพาเลตแบรนด์: slate · purple 3 ระดับ · green · dark green · amber · red · ink
const PRESET_COLORS = [
  '#94a3b8',
  '#9592ff',
  '#6c68e8',
  '#31fb4c',
  '#059669',
  '#f59e0b',
  '#d32f2f',
  '#2f2f2f',
] as const

// ค่าที่ <input type="color"> ต้องมีเสมอเมื่อยังไม่ได้เลือกสี (เหมือนเดิม)
const NATIVE_FALLBACK = '#cccccc'

export function ColorPickerInput({
  value,
  onChange,
  className,
  disabled,
  labelId,
  invalid,
  describedBy,
}: ColorPickerInputProps) {
  const groupName = useId()
  const hex = value ?? ''
  const valid = !hex || HEX_PATTERN.test(hex)
  const normalized = hex.toLowerCase()

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="flex flex-wrap items-center gap-2"
      >
        {PRESET_COLORS.map((color) => (
          <label
            key={color}
            className="relative cursor-pointer has-disabled:cursor-not-allowed has-disabled:opacity-50"
          >
            <input
              type="radio"
              name={groupName}
              value={color}
              checked={normalized === color}
              disabled={disabled}
              onChange={() => onChange(color)}
              className="peer sr-only"
              aria-label={`สี ${color}`}
            />
            <span
              aria-hidden
              className="border-foreground/10 ring-offset-background peer-checked:ring-foreground peer-focus-visible:outline-ring block size-11 rounded-[10px] border ring-offset-2 transition-shadow peer-checked:ring-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 sm:size-[34px]"
              style={{ backgroundColor: color }}
            />
          </label>
        ))}
        <input
          type="color"
          value={valid && hex ? hex : NATIVE_FALLBACK}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          title="เลือกสีอื่น"
          aria-label="เลือกสีอื่น"
          className="border-border focus-visible:outline-ring size-11 cursor-pointer rounded-[10px] border border-dashed bg-transparent p-1 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:size-[34px] [&::-moz-color-swatch]:rounded-[6px] [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-[6px] [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
        />
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={hex}
          onChange={(e) => {
            const v = e.target.value
            onChange(v === '' ? null : v)
          }}
          placeholder="#rrggbb"
          maxLength={7}
          disabled={disabled}
          aria-label="รหัสสี (hex)"
          aria-invalid={invalid || !valid}
          aria-describedby={describedBy}
          className="max-w-[160px] font-mono"
        />
        {hex && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(null)}
            aria-label="ล้างสี"
            title="ล้างสี"
          >
            <X className="size-4" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  )
}
