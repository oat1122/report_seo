'use client'

import * as React from 'react'
import { Accordion as AccordionPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'
import { ChevronDownIcon } from 'lucide-react'

// UI Kit v1.0 (Display 05) — แต่ละข้อเป็น glass tile มุม 18 · หัวสูง ≥ 64 · ไอคอนในวงกลม 40 หมุน 180° เมื่อเปิด
function Accordion({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn('flex w-full flex-col gap-2.5', className)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        'border-border bg-glass-tile data-open:border-accent dark:data-open:bg-card rounded-[18px] border px-[22px] transition-colors data-open:bg-white',
        className,
      )}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger focus-visible:ring-ring/70 relative flex min-h-16 flex-1 items-center justify-between gap-4 rounded-[12px] py-[18px] text-left text-base font-semibold transition-colors outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
        <span
          data-slot="accordion-trigger-icon"
          aria-hidden="true"
          className="border-border dark:bg-input/30 group-aria-expanded/accordion-trigger:bg-info-subtle pointer-events-none ml-auto flex size-10 shrink-0 items-center justify-center rounded-full border bg-white transition-transform duration-200 ease-out group-aria-expanded/accordion-trigger:rotate-180 group-aria-expanded/accordion-trigger:border-transparent motion-reduce:transition-none"
        >
          <ChevronDownIcon className="size-4" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-open:animate-accordion-down data-closed:animate-accordion-up text-text-secondary overflow-hidden text-sm leading-relaxed"
      {...props}
    >
      <div
        className={cn(
          '[&_a]:hover:text-foreground h-(--radix-accordion-content-height) pt-0 pb-[18px] [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4',
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
