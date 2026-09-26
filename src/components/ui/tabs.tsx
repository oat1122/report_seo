'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Tabs as TabsPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn('group/tabs flex gap-2 data-horizontal:flex-col', className)}
      {...props}
    />
  )
}

// UI Kit v1.0 — default = segmented (พื้นขาวโปร่ง มุม 14) · line = เส้นใต้ · vertical = sidebar nav
const tabsListVariants = cva(
  'group/tabs-list text-text-secondary inline-flex w-fit items-center justify-center gap-1 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col group-data-vertical/tabs:items-stretch data-[variant=line]:rounded-none',
  {
    variants: {
      variant: {
        default:
          'border-border dark:border-input dark:bg-input/30 rounded-[14px] border bg-white/70 p-1',
        line: 'border-border gap-[22px] border-b bg-transparent group-data-vertical/tabs:gap-1 group-data-vertical/tabs:border-r group-data-vertical/tabs:border-b-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function TabsList({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "text-text-secondary hover:text-foreground focus-visible:ring-ring/70 relative inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-transparent px-3.5 text-sm whitespace-nowrap transition-[color,background-color,box-shadow] outline-none group-data-vertical/tabs:h-11 group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-vertical/tabs:gap-3 group-data-vertical/tabs:rounded-[12px] group-data-vertical/tabs:px-3 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-45 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'data-active:text-foreground data-active:shadow-info-strong/30 dark:data-active:bg-muted data-active:bg-white data-active:font-medium data-active:shadow-md',
        'group-data-[variant=line]/tabs-list:h-auto group-data-[variant=line]/tabs-list:flex-none group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:px-0 group-data-[variant=line]/tabs-list:py-2.5 group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=line]/tabs-list:data-active:shadow-none dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent',
        'after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-px group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 text-sm outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
