'use client'

import * as React from 'react'
import { OTPInput, OTPInputContext } from 'input-otp'

import { cn } from '@/lib/utils'

// UI Kit v1.0 (Forms 06) — ช่องแยก 46×54 มุม 12 · ตัวเลข 22/600 · แบ่งกลุ่ม 3-3 ด้วยขีดสั้น
function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        'cn-input-otp flex items-center gap-2 has-disabled:opacity-50',
        containerClassName,
      )}
      spellCheck={false}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        'border-input aria-invalid:border-destructive aria-invalid:ring-destructive/12 data-[active=true]:border-info data-[active=true]:inset-ring-info data-[active=true]:ring-info/25 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:inset-ring-destructive dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40 relative flex h-[54px] w-[46px] items-center justify-center rounded-[12px] border bg-white text-[22px] font-semibold tabular-nums transition-[border-color,box-shadow] outline-none aria-invalid:ring-[3px] data-[active=true]:z-10 data-[active=true]:inset-ring-1 data-[active=true]:ring-[3px]',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-[22px] w-[1.5px] duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-separator"
      className={cn('flex items-center px-0.5', className)}
      role="separator"
      {...props}
    >
      <span className="dark:bg-muted-foreground/40 block h-0.5 w-2.5 rounded-full bg-slate-300" />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
