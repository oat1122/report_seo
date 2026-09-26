'use client'

import * as React from 'react'
import { DayPicker, getDefaultClassNames, type DayButton, type Locale } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from 'lucide-react'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'outline',
  weekStartsOn = 1,
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
}) {
  const defaultClassNames = getDefaultClassNames()

  // UI Kit v1.0 (Forms 07) — ช่องวัน 38 มุม 10 · เลือก = bg-primary · วันนี้ = วงชมพู · ช่วง = info-subtle · เริ่มวันจันทร์
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      weekStartsOn={weekStartsOn}
      className={cn(
        'group/calendar bg-background p-3.5 [--cell-radius:10px] [--cell-size:--spacing(9.5)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn('relative flex flex-col gap-4 md:flex-row', defaultClassNames.months),
        month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-[34px] rounded-[10px] p-0 select-none aria-disabled:opacity-50',
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-[34px] rounded-[10px] p-0 select-none aria-disabled:opacity-50',
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          'flex h-[34px] w-full items-center justify-center px-[34px]',
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          'flex h-[34px] w-full items-center justify-center gap-1.5 text-[15px] font-semibold',
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn('relative rounded-(--cell-radius)', defaultClassNames.dropdown_root),
        dropdown: cn('bg-popover absolute inset-0 opacity-0', defaultClassNames.dropdown),
        caption_label: cn(
          'font-semibold select-none',
          captionLayout === 'label'
            ? 'text-[15px]'
            : '[&>svg]:text-muted-foreground flex items-center gap-1 rounded-(--cell-radius) text-[15px] [&>svg]:size-3.5',
          defaultClassNames.caption_label,
        ),
        weekdays: cn('flex gap-0.5', defaultClassNames.weekdays),
        weekday: cn(
          'text-muted-foreground flex-1 rounded-(--cell-radius) py-1 text-[11px] font-normal select-none',
          defaultClassNames.weekday,
        ),
        week: cn('mt-0.5 flex w-full gap-0.5', defaultClassNames.week),
        week_number_header: cn('w-(--cell-size) select-none', defaultClassNames.week_number_header),
        week_number: cn(
          'text-muted-foreground text-[11px] select-none',
          defaultClassNames.week_number,
        ),
        day: cn(
          'group/day relative h-(--cell-size) w-full rounded-(--cell-radius) p-0 text-center select-none',
          defaultClassNames.day,
        ),
        range_start: cn('rounded-(--cell-radius)', defaultClassNames.range_start),
        range_middle: cn('rounded-(--cell-radius)', defaultClassNames.range_middle),
        range_end: cn('rounded-(--cell-radius)', defaultClassNames.range_end),
        today: cn('rounded-(--cell-radius)', defaultClassNames.today),
        outside: cn(
          'text-muted-foreground/60 aria-selected:text-muted-foreground',
          defaultClassNames.outside,
        ),
        disabled: cn('text-muted-foreground opacity-50', defaultClassNames.disabled),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return <ChevronLeftIcon className={cn('size-4', className)} {...props} />
          }

          if (orientation === 'right') {
            return <ChevronRightIcon className={cn('size-4', className)} {...props} />
          }

          return <ChevronDownIcon className={cn('size-4', className)} {...props} />
        },
        DayButton: ({ ...props }) => <CalendarDayButton locale={locale} {...props} />,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      data-today={modifiers.today}
      className={cn(
        'group-data-[focused=true]/day:ring-ring/70 data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:bg-info-subtle data-[range-middle=true]:text-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[today=true]:inset-ring-neon-pink dark:hover:text-foreground relative isolate z-10 flex size-auto h-(--cell-size) w-full min-w-(--cell-size) flex-col gap-1 rounded-(--cell-radius) border-0 text-[13px] leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:font-semibold data-[range-start=true]:font-semibold data-[selected-single=true]:font-semibold data-[today=true]:font-semibold data-[today=true]:inset-ring-[1.5px] [&>span]:text-xs [&>span]:opacity-70',
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
