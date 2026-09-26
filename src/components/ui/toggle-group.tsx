'use client'

import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'
import { toggleVariants } from '@/components/ui/toggle'

// UI Kit v1.0 (Forms 05)
// spacing=0 (ค่าเริ่มต้น) = segmented: กรอบขาวโปร่งมุม 14 · ตัวที่เลือกพื้นขาว + เงาม่วง (ใช้กับ type="single")
// spacing>0 = chips: pill ขอบบาง · ตัวที่เลือกพื้นเข้ม (ใช้กับ type="multiple" เช่นตัวกรอง)
const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: 'horizontal' | 'vertical'
  }
>({
  size: 'default',
  variant: 'default',
  spacing: 0,
  orientation: 'horizontal',
})

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  orientation = 'horizontal',
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: 'horizontal' | 'vertical'
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ '--gap': spacing } as React.CSSProperties}
      className={cn(
        'group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-vertical:flex-col data-vertical:items-stretch',
        'data-[spacing=0]:border-border dark:data-[spacing=0]:bg-input/30 data-[spacing=0]:gap-1 data-[spacing=0]:rounded-[14px] data-[spacing=0]:border data-[spacing=0]:bg-white/75 data-[spacing=0]:p-1',
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing, orientation }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant = 'default',
  size = 'default',
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        'shrink-0 focus:z-10 focus-visible:z-10',
        // segmented
        'data-[spacing=0]:text-text-secondary data-[spacing=0]:hover:text-foreground data-[spacing=0]:data-[state=on]:text-foreground data-[spacing=0]:data-[state=on]:shadow-info-strong/30 dark:data-[spacing=0]:data-[state=on]:bg-muted data-[spacing=0]:h-9 data-[spacing=0]:rounded-[10px] data-[spacing=0]:border-0 data-[spacing=0]:px-3.5 data-[spacing=0]:data-[state=off]:hover:bg-transparent data-[spacing=0]:data-[state=on]:bg-white data-[spacing=0]:data-[state=on]:shadow-md data-[spacing=0]:data-[state=on]:inset-ring-0',
        // chips
        'not-data-[spacing=0]:border-border not-data-[spacing=0]:data-[state=on]:border-primary not-data-[spacing=0]:data-[state=on]:bg-primary not-data-[spacing=0]:data-[state=on]:text-primary-foreground dark:not-data-[spacing=0]:bg-input/30 dark:not-data-[spacing=0]:data-[state=on]:bg-primary not-data-[spacing=0]:h-9 not-data-[spacing=0]:rounded-full not-data-[spacing=0]:border not-data-[spacing=0]:bg-white not-data-[spacing=0]:px-3.5 not-data-[spacing=0]:data-[state=on]:inset-ring-0',
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
